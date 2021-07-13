import { v4 as uuidv4 } from 'uuid';
import SubpingDDB from "subpingddb";
import AddressModel from "subpingddb/model/subpingTable/address";
import DefaultAddressModel from "subpingddb/model/subpingTable/defaultAddress";
import { APIGatewayProxyHandler } from 'aws-lambda';

import { success, failure } from "../../libs/response-lib";

export const handler: APIGatewayProxyHandler = async (event, _context) => {
    try {
        const header = event.headers;
        const PK = header.pk;
        const uuid = uuidv4();

        console.log(PK);

    }

    catch (e) {
        console.log(e);
        return failure({
            success: false,
            message: "MakeAddressException"
        })
    }
}
