'use strict';

import { APIGatewayProxyHandler } from "aws-lambda";
import SubpingDDB from "subpingddb";
import RsaModel from "subpingddb/model/keyTable/rsaKey";

import { success, failure } from "../../libs/response-lib";
import RSA from "../../libs/RSA";

export const handler: APIGatewayProxyHandler = async (event, context) => {
    try {
        const header = event.headers;
        const deviceId = header.deviceid;

        const subpingDDB = new SubpingDDB(process.env.keyTable);
        const controller = subpingDDB.getController();

        const existKey = (await controller.read("uniqueId-Index", deviceId)).Items[0];

        let publicKey;
        console.log("existKey", existKey)

        if (existKey) {
            publicKey = existKey.publicKey;
        }

        else {
            const rsaKeys = await RSA.generateKeyPair();

            const property: RsaModel = {
                "uniqueId": deviceId,
                "publicKey": rsaKeys.publicKey,
                "privateKey": rsaKeys.privateKey
            }

            await controller.create<RsaModel>(property);

            publicKey = rsaKeys.publicKey;
        }

        return success({
            success: true,
            message: "done",
            publicKey: publicKey
        })
    }
    catch (e) {
        console.error(e);
        failure({
            success: false,
            message: "SecureInitializeException"
        })
    }

};
