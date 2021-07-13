'use strict';

import { APIGatewayProxyHandler } from "aws-lambda";
import * as AWS from "aws-sdk";

import RSA from "../../libs/RSA";
import { success, failure } from "../../libs/response-lib";
import * as dynamodb from "../../libs//dynamodb-lib";
import { makeUser } from "../../query/query";
import SubpingDDB from "subpingddb";

export const handler: APIGatewayProxyHandler = async (event, context) => {
    try {
        const header = event.headers;
        const body = JSON.parse(event.body || "");

        const deviceId = header.deviceid;
        const subpingDDBAuth = new SubpingDDB(process.env.authTable);
        const subpingDDBKey = new SubpingDDB(process.env.keyTable);
        const authController = subpingDDBAuth.getController();
        const keyController = subpingDDBKey.getController();

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
                            throw new Error("CognitoException");
                        }

                        else {
                            // SubpingDDB에서 어떻게 처리할지 고민해야 함.
                            await dynamodb.call("transactWrite", makeUser(email, name, birthDay, CI, phoneNumber, carrier))
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
        return failure({
            success: false,
            message: "SignUpException"
        })
    }
};
