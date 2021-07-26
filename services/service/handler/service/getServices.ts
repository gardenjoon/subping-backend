import SubpingRDB, { Repository, Entity } from "subpingrdb";
import ServiceModel from "subpingddb/model/subpingTable/service"
import { APIGatewayProxyHandler } from 'aws-lambda';

import { success, failure } from "../../libs/response-lib";


export const handler: APIGatewayProxyHandler = async (event, _context) => {
    try {
        let response = [];
        const body = JSON.parse(event.body || "");
        
        const requestedCategory = body.category || null;

        const subpingRDB = new SubpingRDB();
        const connection = await subpingRDB.getConnection("dev");
        const categoryRepository = connection.getCustomRepository(Repository.CategoryRepository);

        if(requestedCategory) {
            response = await categoryRepository.findServiceByCategory(requestedCategory)

            return success({
                success: true,
                message: response  
            })
        }

        else {
            return failure({
                success: false,
                message: "NoRequestedCategoryException"
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

