import SubpingDDB from "subpingddb";
import ServiceModel from "subpingddb/model/subpingTable/service";
import CategoryModel from "subpingddb/model/subpingTable/category";

import { APIGatewayProxyHandler } from 'aws-lambda';
import { v4 as uuidv4 } from 'uuid';
import ServiceEventModel from "../../../../modules/SubpingDDB/model/subpingTable/serviceEvent";
import { success, failure } from "../../libs/response-lib";


export const handler: APIGatewayProxyHandler = async (event, _context) => {
    const checkAvailable = async (controller, category, serviceName) => {
        const categoryModel:CategoryModel[] = (await controller.read("SK-PK-Index", `category#${category}`)).Items;
        const serviceModel: ServiceModel[] = (await controller.read("SK-PK-Index", `service#${category}`, null, {
            serviceName: serviceName
        })).Items;
        
        if(categoryModel && serviceModel.length === 0) {
            return true;
        }

        else {
            return false;
        }
    }

    try {
        const subpingDDB = new SubpingDDB(process.env.subpingTable);
        const controller = subpingDDB.getController();
        
        const serviceName = "술담화";
        const serviceSummary = "매달 다른 술을 배송해드릴게요 😀";
        const serviceSquareLogoUrl = "https://subping-assets.s3.ap-northeast-2.amazonaws.com/serviceLogo/watcha.png"
        const serviceCategory = "식품";
        const serviceTags = ["주류", "전통주"];
        const servicePK = `service#${uuidv4()}`;
        
        const serviceModel: ServiceModel = {
            PK: servicePK,
            SK: `service#${serviceCategory}`,
            createdAt: null,
            updatedAt: null,
            model: "service",
            serviceCode: servicePK,
            serviceName: serviceName,
            serviceSummary: serviceSummary,
            serviceCategory: serviceCategory,
            serviceSquareLogoUrl: serviceSquareLogoUrl,
            serviceTags: serviceTags
        }
        
        const serviceEvent: ServiceEventModel = {
            PK: servicePK,
            SK: `event#${serviceName}`,
            createdAt: null,
            updatedAt: null,
            model: "event",
            serviceCode: servicePK,
            dailySubscribers: 0,
            dailyReviews: 0,
            dailyWatchers: 0,
        }

        if(await checkAvailable(controller, serviceCategory, serviceName)) {
            await controller.transactionCreate([
                serviceModel,
                serviceEvent
            ])
        }

        else {
            return failure({
                success: false,
                message: "MakeServiceConditionException"
            })
        }
    } 

    catch (e) {
        console.log(e);
        return failure({
            success: false,
            message: "MakeServiceException"
        })
    }
}

