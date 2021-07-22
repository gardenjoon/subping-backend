'use strict';

import { APIGatewayProxyHandler } from "aws-lambda";
import SubpingDDB from "@SubpingDDB";

import { success, failure } from "../../libs/response-lib";

export const handler: APIGatewayProxyHandler = async (event, context) => {
    try {
        const header = event.headers;
        const PK = header.pk;
        const subpingDDB = new SubpingDDB(process.env.subpingTable)
        const controller = subpingDDB.getController();

        const userAddressCount = (await controller.read("model-PK-Index", "address", PK)).ScannedCount

        if (userAddressCount === 0) {
            return failure({
                success: false,
                message: "UserAddressNotExistException"
            })
        }

        else {
            return success({
                success: true,
                message: "done"
            })
        }
    }

    catch (e) {
        return failure({
            success: false,
            message: "OnboardingStepException"
        })
    }
};
