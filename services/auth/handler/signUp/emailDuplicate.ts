'use strict';

import { APIGatewayProxyHandler } from "aws-lambda";
import SubpingDDB from "subpingddb";

import { success, failure } from "../../libs/response-lib";

export const handler: APIGatewayProxyHandler = async (event, context) => {
    try {
        const body = JSON.parse(event.body || "");
        const email = body.email;

        const subpingDDB = new SubpingDDB(process.env.subpingTable);
        const controller = subpingDDB.getController();
        const userDB = (await controller.read("model-PK-Index", "user", email)).Items[0];

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
