'use strict';

import { APIGatewayProxyHandler } from "aws-lambda";
import * as AWS from "aws-sdk";
import SubpingRDB, { Entity } from "subpingrdb";
import SubpingDDB from "subpingddb";

import RSA from "../../libs/RSA";
import { success, failure } from "../../libs/response-lib";

export const handler: APIGatewayProxyHandler = async (event, context) => {
    try {
        const header = event.headers;
        const body = JSON.parse(event.body || "");

        const deviceId = header.deviceid;
        const subpingDDBAuth = new SubpingDDB(process.env.authTable);
        const subpingDDBKey = new SubpingDDB(process.env.keyTable);
        const authController = subpingDDBAuth.getController();
        const keyController = subpingDDBKey.getController();
        const subpingRDB = new SubpingRDB()

        const userAuth = (await authController.read("uniqueId-Index", deviceId)).Items[0]
        const userKey = (await keyController.read("uniqueId-Index", deviceId)).Items[0]

        if (!userAuth) {
            return failure({
                success: false,
                message: "AuthExpiredException"
            })
        }

        const email = userAuth.email
        const password = userAuth.password
        const carrier = body.carrier;
        const name = body.name;
        const phoneNumber = body.phoneNumber;
        const birthDay = body.birthDay;
        const CI = body.ci;
        const gender = body.gender;

        console.log(`[signUpDone] 회원가입 요청 시작\ndeviceId: '${deviceId}'\nemail: '${email}'`)

        if (carrier && name && phoneNumber && birthDay && CI && email && password) {
            // CI 검증 로직 필요함.

            const cognitoProvider = new AWS.CognitoIdentityServiceProvider({
                region: "ap-northeast-2",
            });

            const decryptedPassword = await RSA.decrypt(password, userKey.privateKey);

            console.log(decryptedPassword);

            await new Promise((resolve, reject) => cognitoProvider.adminCreateUser({
                UserPoolId: "ap-northeast-2_VzCrSsELb",
                Username: email,
                UserAttributes: [
                    {
                        "Name": "name",
                        "Value": name
                    }
                ],
                MessageAction: "SUPPRESS"
            }, (err, data) => {
                if (err) {
                    console.log(err)
                    throw new Error("CognitoException");
                }

                else {
                    cognitoProvider.adminSetUserPassword({
                        UserPoolId: "ap-northeast-2_VzCrSsELb",
                        Username: email,
                        Password: decryptedPassword,
                        Permanent: true,
                    }, async (err, data) => {
                        if (err) {
                            console.log(err)
                            throw new Error("CognitoException");
                        }

                        else {
                            const rdbConnection = await subpingRDB.getConnection("dev");
                            const userRepository = rdbConnection.getRepository(Entity.User);
                            const user = new Entity.User();

                            user.email = email;
                            user.name = name;
                            user.carrier = carrier;
                            user.birthday = new Date(birthDay);
                            user.gender = gender;
                            user.ci = CI;
                            user.phoneNumber = phoneNumber;

                            await userRepository.save(user);
                            resolve(null)
                        }
                    })
                }
            }))
        }

        else {
            return failure({
                success: false,
                message: "ParameterException"
            })
        }

        return success({
            success: true,
            message: "done"
        })
    }

    catch (e) {
        console.log(e) 
        return failure({
            success: false,
            message: "SignUpException"
        })
    }
};
