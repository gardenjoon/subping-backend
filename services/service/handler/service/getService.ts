import SubpingRDB, { Repository, Entity } from "subpingrdb";
import { APIGatewayProxyHandler } from 'aws-lambda';

import { success, failure } from "../../libs/response-lib";

export const handler: APIGatewayProxyHandler = async (event, _context) => {
    try {
        let response = [];
        // const body = JSON.parse(event.body || "");
        
        // const requestedService = body.service || null;
        const requestedService = "4dd6a155-be2e-4ca3-b3b0-6e044d5766dd";

        const subpingRDB = new SubpingRDB();
        const connection = await subpingRDB.getConnection("dev");
        const serviceRepository = connection.getCustomRepository(Repository.Service);

        if(requestedService) {
            response = await serviceRepository.getServiceWithId(requestedService);

            return success({
                success: true,
                message: response  
            })
        }

        else {
            return failure({
                success: false,
                message: "NoRequestedServiceException"
            })
        }
    }

    catch (e) {
        console.log(e);
        return failure({
            success: false,
            message: "GetServicesException"
        })
    }
}

