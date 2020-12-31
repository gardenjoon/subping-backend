'use strict';

import { APIGatewayProxyHandler } from "aws-lambda";
import * as AWS from "aws-sdk";

import { success, failure } from "../../libs/response-lib";
import * as dynamodb from "../../libs/dynamodb-lib";
import { getAddress } from "../../query/query";

export const handler: APIGatewayProxyHandler = async (event, context) => {
    try {
        const header = event.headers;
        const PK = header.pk;

        const userAddress = (await dynamodb.call("query", getAddress(PK))).Items;

        if (userAddress.length === 0) {
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
