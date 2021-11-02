import SubpingRDB, { Repository } from "subpingrdb";

import { APIGatewayProxyHandler } from 'aws-lambda';
import { success, failure } from "../../libs/response-lib";

export const handler: APIGatewayProxyHandler = async (event, _context) => {
    try {
        let response = [];

        const userId = event.headers.id;
        const body = JSON.parse(event.body || "");
        
        const serviceId = body?.serviceId;
        
        const subpingRDB = new SubpingRDB()
        const connection = await subpingRDB.getConnection("dev");

        const subscribeRepository = connection.getCustomRepository(Repository.Subscribe);

        if (serviceId) {
            const subscribe = await subscribeRepository.querySubscribesByServiceId(userId, serviceId);
            if(subscribe) {
                response = [subscribe];
            }
        }

        else {
            response = await subscribeRepository.querySubscribes(userId, {
                service: true
            });
        }
        
        if(response.length != 0) {
            return success({
                success: true,
                message: response  
            });
        } else {
            return failure({
                success: false,
                message: "NoUserSubscribesException"
            })
        }
    }

    catch (e) {
        console.log(e);
        return failure({
            success: false,
            message: "GetSubscribeException"
        });
    }
}