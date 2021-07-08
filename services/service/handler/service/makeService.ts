import SubpingDDB from "subpingddb";
import ServiceModel from "subpingddb/model/subpingTable/service";
import { APIGatewayProxyHandler } from 'aws-lambda';
import { v4 as uuidv4 } from 'uuid';
import ServiceEventModel from "../../../../modules/SubpingDDB/model/subpingTable/serviceEvent";
import { success, failure } from "../../libs/response-lib";


export const handler: APIGatewayProxyHandler = async (event, _context) => {
    try {
        const serviceName = "술담화";
        const serviceSummary = "매달 다른 술을 배송해드릴게요 😀";
        const serviceSquareLogoUrl = "https://subping-assets.s3.ap-northeast-2.amazonaws.com/serviceLogo/watcha.png"
        const serviceTags = ["주류", "전통주"];
        const serviceCategory = "식품";
        const servicePK = uuidv4();

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
 
        const subpingDDB = new SubpingDDB(process.env.subpingTable);
        const controller = subpingDDB.getController();

        const serviceEvent: ServiceEventModel = {
            PK: servicePK,
            SK: `event`,
            createdAt: null,
            updatedAt: null,
            model: "event",
            serviceCode: servicePK,
            dailySubscribers: 0,
            dailyReviews: 0,
            dailyWatchers: 0,
        }
        
        await controller.transactionCreate([
            serviceModel,
            serviceEvent
        ])
    }

    catch (e) {
        console.log(e);
        return failure({
            success: false,
            message: "MakeServiceException"
        })
    }
}

