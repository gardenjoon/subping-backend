'use strict';

import { APIGatewayProxyHandler } from "aws-lambda";

import { success, failure } from "../../libs/response-lib";
import RSA from "../../libs/RSA";
import * as dynamodb from "../../libs//dynamodb-lib";
import { getRSAKey, putRSAKey } from "../../query/query";

export const handler: APIGatewayProxyHandler = async (event, context) => {
    const header = event.headers;
    const deviceId = header.deviceid;
    const existKey = await dynamodb.call("get", getRSAKey(deviceId));

    let publicKey;
    console.log("existKey", existKey)

    if (existKey.Item) {
        publicKey = existKey.Item.publicKey;
    }

    else {
        const rsaKeys = await RSA.generateKeyPair();
        await dynamodb.call("put", putRSAKey(deviceId, rsaKeys.publicKey, rsaKeys.privateKey));

        publicKey = rsaKeys.publicKey;
    }

    return success({
        success: true,
        message: "done",
        publicKey: publicKey
    })
};
