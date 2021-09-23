import SubpingRDB, { Repository } from "subpingrdb";

import * as moment from "moment-timezone";

import { APIGatewayProxyHandler } from 'aws-lambda';
import { success, failure } from "../../libs/response-lib";

export const handler: APIGatewayProxyHandler = async (event, _context) => {
    try {
        const subpingRDB = new SubpingRDB();
        const connection = subpingRDB.getConnection("dev");
        
    }

    catch (e) {

    }
}