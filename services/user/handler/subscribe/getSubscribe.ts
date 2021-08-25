import SubpingRDB, { Repository } from "subpingrdb";

import { APIGatewayProxyHandler } from 'aws-lambda';
import { success, failure } from "../../libs/response-lib";

export const handler: APIGatewayProxyHandler = async (event, _context) => {
    try {
        let response = [];

        const header = event.headers;
        const PK = header.email;
        const body = JSON.parse(event.body || "");
        
        const { productId } = body;

        const subpingRDB = new SubpingRDB()
        const connection = await subpingRDB.getConnection("dev");

        const subscribeRepository = connection.getCustomRepository(Repository.Subscribe);

        if (productId) {
            response = await subscribeRepository.getOneSubscribe(PK, productId);
        }

        else {
            response = await subscribeRepository.getSubscribes(PK);
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