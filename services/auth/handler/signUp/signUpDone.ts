'use strict';

import { APIGatewayProxyHandler } from "aws-lambda";
import * as AWS from "aws-sdk";

import RSA from "../../libs/RSA";
import { success, failure } from "../../libs/response-lib";
import * as dynamodb from "../../libs//dynamodb-lib";
import { getAuth, getRSAKey, makeUser } from "../../query/query";

export const handler: APIGatewayProxyHandler = async (event, context) => {
    try {
        const header = event.headers;
        const body = JSON.parse(event.body || "");

        const deviceId = header.deviceid;
        const userAuth = (await dynamodb.call("get", getAuth(deviceId))).Item;
        const userKey = (await dynamodb.call("get", getRSAKey(deviceId))).Item;

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
                            await dynamodb.call("transactWrite", makeUser(email, name, birthDay, CI, phoneNumber, carrier))
                            resolve()
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
