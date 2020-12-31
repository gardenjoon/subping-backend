'use strict';

import { APIGatewayProxyHandler } from "aws-lambda";
import * as AWS from "aws-sdk";

import { success, failure } from "../../libs/response-lib";
import { deleteAttr, getUser, getUserAllAttr } from "../../query/query"
import * as dynamodb from "../../libs//dynamodb-lib";
import { makeAuth } from "../../query/query";

export const handler: APIGatewayProxyHandler = async (event, context) => {
    const _getUser = async (email) => {
        const cognitoProvider = new AWS.CognitoIdentityServiceProvider({
            region: "ap-northeast-2",
        });

        const userCognito = await new Promise((resolve, reject) => cognitoProvider.adminGetUser({
            UserPoolId: "ap-northeast-2_VzCrSsELb",
            Username: email
        }, (err, data) => {
            if (err) {
                switch (err.code) {
                    case "UserNotFoundException":
                        resolve(null)
                        break
                    default:
                        console.log(err)
                        throw new Error("cognitoException");
                }
            }

            resolve(data)
        }))

        const userDB = (await dynamodb.call("query", getUser(email))).Items[0]

        return {
            cognito: userCognito,
            db: userDB
        };
    }

    const _deleteCognitoUser = async (email) => {
        const cognitoProvider = new AWS.CognitoIdentityServiceProvider({
            region: "ap-northeast-2",
        });

        await new Promise((resolve, reject) => cognitoProvider.adminDeleteUser({
            UserPoolId: "ap-northeast-2_VzCrSsELb",
            Username: email
        }, (err, data) => {
            if (err) {
                switch (err.code) {
                    default:
                        console.log(err)
                        throw new Error("cognitoException");
                }
            }

            resolve(data)
        }))
    }

    const _deleteDBUser = async (email) => {
        const userAll = (await dynamodb.call("query", getUserAllAttr(email))).Items;

        for (const row of userAll) {
            await dynamodb.call("delete", deleteAttr(email, row.SK))
        }
    }

    try {
        const header = event.headers;
        const body = JSON.parse(event.body || "");

        const deviceId = header.deviceid;
        const email = body.email;
        const password = body.password;
        const ttl = Math.round(Date.now() / 1000) + 600;

        console.log(`[signUpStart] 회원가입 요청 시작\ndeviceId: '${deviceId}'\nemail: '${email}'`)

        const existUser = await _getUser(email)

        console.log(existUser)

        if (existUser.cognito) {
            if (!existUser.db) {
                // 코그니토 있고 DB 없는 경우
                console.log("[signUpStart] Cognito 있음, DB 없음")
                await _deleteCognitoUser(email);
                console.log("[signUpStart] Cognito 제거 완료")
            }

            else {
                // 코그니토 있고 DB도 있는 경우
                console.log("[signUpStart] Cognito 있음, DB 있음")
                return failure({
                    success: false,
                    message: "UserExistException"
                })
            }
        }

        else {
            if (existUser.db) {
                console.log("[signUpStart] Cognito 없음, DB 있음")
                // 코그니토 없고 DB 있는 경우
                await _deleteDBUser(email);
                console.log("[signUpStart] DB 제거 완료")
            }
            // 코그니토 없고 DB 없는 경우
        }

        await dynamodb.call("put", makeAuth(deviceId, email, password, ttl));
        console.log("[signUpStart] Auth 생성 완료")

        return success({
            success: true,
            message: "done"
        })
    }

    catch (e) {
        console.error(e)
        return failure({
            success: false,
            message: "SignUpStartExepction"
        })
    }
};
