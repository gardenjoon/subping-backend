'use strict';

import { APIGatewayProxyHandler } from "aws-lambda";
import * as AWS from "aws-sdk";
import SubpingDDB from "subpingddb";
import AuthModel from "subpingddb/model/authTable/auth";

import { success, failure } from "../../libs/response-lib";

export const handler: APIGatewayProxyHandler = async (event, context) => {
    const subpingDDBCore = new SubpingDDB(process.env.subpingTable);
    const coreController = subpingDDBCore.getController();
    const subpingDDBAuth = new SubpingDDB(process.env.authTable);
    const authController = subpingDDBAuth.getController();

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

        const userDB = (await coreController.read("model-PK-Index", email, "user")).Items[0]

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
        const userAll = (await coreController.read("PK-SK-Index", email)).Items

        for (const row of userAll) {
            await coreController.delete(email, row.SK);
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

        const authModel: AuthModel = {
            uniqueId: deviceId,
            email: email,
            password: password,
            ttl: ttl
        }
        await authController.create<AuthModel>(authModel);
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
