'use strict';

import * as AWS from "aws-sdk";
import { APIGatewayProxyHandler } from "aws-lambda";
import SubpingRDB, {Entity} from "@SubpingRDB";

import { success, failure } from "../../libs/response-lib";

export const handler: APIGatewayProxyHandler = async (event, context) => {
    const subpingRDB = new SubpingRDB();
    const rdbConnection = await subpingRDB.createConnection("dev");

    const _getUser = async (email: string) => {
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

        const userRepository = rdbConnection.getRepository(Entity.User);
        const userDB = await userRepository.findOne({
            email: email
        })

        return {
            cognito: userCognito,
            db: userDB
        };
    }

    try {
        const body = JSON.parse(event.body || "");
        const email = body.email;
        
        const user = await _getUser(email);

        if (user.db && user.cognito) {
            return success({
                success: false,
                message: "EmailExistException"
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
            message: "EmailDuplicateException"
        })
    }
};
