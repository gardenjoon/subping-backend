import SubpingRDB, { Repository } from "subpingrdb";

import { APIGatewayProxyHandler } from 'aws-lambda';
import { success, failure } from "../../libs/response-lib";

export const handler: APIGatewayProxyHandler = async (event, _context) => {
    try {
        let response = [];

        const userId = event.headers.id;
        const body = JSON.parse(event.body || "");
        
        const { productId } = body;

        const subpingRDB = new SubpingRDB()
        const connection = await subpingRDB.getConnection("dev");

        const subscribeRepository = connection.getCustomRepository(Repository.Subscribe);

        if (productId) {
            response = await subscribeRepository.querySubscribeByProductId(userId, productId);
        }

        else {
            response = await subscribeRepository.querySubscribes(userId);
        }
        
        return success({
            success: true,
            message: response  
        });
    }

    catch (e) {
        console.log(e);
        return failure({
            success: false,
            message: "GetSubscribeException"
        });
    }
}