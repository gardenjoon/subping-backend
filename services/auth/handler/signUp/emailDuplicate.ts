'use strict';

import { APIGatewayProxyHandler } from "aws-lambda";

import { success, failure } from "../../libs/response-lib";
import * as dynamodb from "../../libs//dynamodb-lib";
import { getUser } from "../../query/query";

export const handler: APIGatewayProxyHandler = async (event, context) => {
    try {
        const body = JSON.parse(event.body || "");
        const email = body.email;

        const userDB = (await dynamodb.call("query", getUser(email))).Items[0]

        if (userDB) {
            return success({
                success: false,
                message: "emailExistException"
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
            message: "emailDuplicateException"
        })
    }
};
