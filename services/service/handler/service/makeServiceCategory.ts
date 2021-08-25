import SubpingRDB, { Repository, Entity } from "subpingrdb";

import { APIGatewayProxyHandler } from 'aws-lambda';
import { success, failure } from "../../libs/response-lib";

export const handler: APIGatewayProxyHandler = async (event, _context) => {
    try {
        const body = JSON.parse(event.body || "");
        const { serviceId, category} = body;
        const subpingRDB = new SubpingRDB();
        const connection = await subpingRDB.getConnection("dev");

        const serviceCategoryRepository = connection.getCustomRepository(Repository.ServiceCategory);

        const serviceCategoryModel = new Entity.ServiceCategory();
        serviceCategoryModel.service = serviceId;
        serviceCategoryModel.category = category;
        await serviceCategoryRepository.saveServiceCategory(serviceCategoryModel);

        return success({
            success: true,
            message: "MakeServiceSuccess"
        })
    } 

    catch (e) {
        console.log(e);
        return failure({
            success: false,
            message: "MakeServiceException"
        })
    }
}