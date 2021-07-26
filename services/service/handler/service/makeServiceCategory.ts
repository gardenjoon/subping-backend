import SubpingRDB, { Repository } from "subpingrdb";


import { APIGatewayProxyHandler } from 'aws-lambda';
import { success, failure } from "../../libs/response-lib";

export const handler: APIGatewayProxyHandler = async (event, _context) => {
    try {
        const subpingRDB = new SubpingRDB();
        const connection = await subpingRDB.getConnection("dev");
        const serviceCategoryRP = connection.getCustomRepository(Repository.ServiceCategoryRepository);
        const serviceRP = connection.getCustomRepository(Repository.ServiceRepository)
        
        const allService = await serviceRP.findAllService()
        for (const element of allService){
            const serviceCategoryModel = new Repository.ServiceCategoryRepository();
            if (element.name == "왓챠"){
                serviceCategoryModel.service = element.id
                serviceCategoryModel.category = "미디어"
            }
            else if (element.name == "넷플릭스"){
                serviceCategoryModel.service = element.id
                serviceCategoryModel.category = "미디어"
            }
            else if (element.name == "술담화"){
                serviceCategoryModel.service = element.id
                serviceCategoryModel.category = "식품"
            }
            else if (element.name == "부산일보"){
                serviceCategoryModel.service = element.id
                serviceCategoryModel.category = "사회"
            }
            await serviceCategoryRP.saveServiceCategory(serviceCategoryModel)
        }

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

