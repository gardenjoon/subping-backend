import SubpingRDB, { Repository } from "subpingrdb";

import { APIGatewayProxyHandler } from 'aws-lambda';
import { success, failure } from "../../libs/response-lib";

export const handler: APIGatewayProxyHandler = async (event, _context) => {
    try {
        const subpingRDB = new SubpingRDB();
        const connection = await subpingRDB.getConnection("dev");
        const subscribeRepository = connection.getCustomRepository(Repository.Subscribe);
        const subscribe = await subscribeRepository.getSubscribe("jsw9808@gmail.com")
        return success({
            success: true,
            message: subscribe  
        })
    }

    catch (e) {
        console.log(e);
        return failure({
            success: false,
            message: "GetSubscribeException"
        })
    }
} 