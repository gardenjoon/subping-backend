import SubpingRDB, { Repository } from "subpingrdb";

import { APIGatewayProxyHandler } from 'aws-lambda';
import { success, failure } from "../../libs/response-lib";


export const handler: APIGatewayProxyHandler = async (event, _context) => {
    try {
        const subpingRDB = new SubpingRDB();
        const connection = await subpingRDB.getConnection("dev");
        const repository = connection.getCustomRepository(Repository.ServiceRepository)
        
        const serviceModel = new Repository.ServiceRepository();
        serviceModel.seller = "wonjoon@joiple.co"
        serviceModel.name = element.serviceName
        
        if(element.serviceName == ("왓챠"||"넷플릭스")){
            serviceModel.type = "online"
        }
        else {
            serviceModel.type = "delivery"
        }

        serviceModel.serviceLogoUrl = "https://subping-assets.s3.ap-northeast-2.amazonaws.com/serviceLogo/watcha.png"
        serviceModel.summary = element.serviceSummary
        
        await repository.save(serviceModel)

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

