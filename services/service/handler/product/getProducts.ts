import SubpingRDB, { Repository } from "subpingrdb";
import { APIGatewayProxyHandler } from 'aws-lambda';

import { success, failure } from "../../libs/response-lib";

export const handler: APIGatewayProxyHandler = async (event, _context) => {
    try {
        let response = [];
        const body = JSON.parse(event.body || "");
        
        const requestedService = body.service || null;

        const subpingRDB = new SubpingRDB();
        const connection = await subpingRDB.getConnection("dev");
        const productRepository = connection.getCustomRepository(Repository.Product);

        if(requestedService) {
            response = await productRepository.queryProducts(requestedService);

            return success({
                success: true,
                message: response  
            })
        }

        else {
            return failure({
                success: false,
                message: "NoRequestedService"
            })
        }
    }

    catch (e) {
        console.log(e);
        return failure({
            success: false,
            message: "GetProductsException"
        })
    }
}

