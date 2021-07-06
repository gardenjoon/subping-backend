import SubpingDDB from "subpingddb";
import ServiceModel from "subpingddb/model/subpingTable/service"
import { APIGatewayProxyHandler } from 'aws-lambda';

import { success, failure } from "../../libs/response-lib";

interface Category {
    [key:string]: Array<ServiceModel>
}

export const handler: APIGatewayProxyHandler = async (event, _context) => {
    try {
        let response: Category = {};
        const body = JSON.parse(event.body || "");
        
        // 특정 카테고리에 대한 요청이 있을 경우
        const requestedCategory = body.category || null;

        const subpingDDB = new SubpingDDB(process.env.subpingTable);
        const controller = subpingDDB.getController();
        
        if(!requestedCategory) {
            const services = (await controller.read("model-PK-Index", "service")).Items;
        
            for(const service of services){
                if (!Object.keys(response).includes(service.serviceCategory)){
                    response[service.serviceCategory] = [service];
                }
    
                else {
                    response[service.serviceCategory].push(service);
                }
            }
        } 

        else {
            const services = (await controller.readWithFilter("model-PK-Index", "service", null, {
                serviceCategory: requestedCategory
            })).Items;
            
            response[requestedCategory] = services;
        }
        
        return success({
            success: true,
            message: response  
        })
    }

    catch (e) {
        console.log(e);
        return failure({
            success: false,
            message: "GetServicesException"
        })
    }
}

