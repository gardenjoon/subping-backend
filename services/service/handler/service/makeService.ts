import SubpingDDB from "subpingddb";
import ServiceModel from "subpingddb/model/subpingTable/service";
import { APIGatewayProxyHandler } from 'aws-lambda';

import { success, failure } from "../../libs/response-lib";


const serviceList: ServiceModel[] = [
    {
        PK: "SUB-202001-00001",
        SK: `service#왓챠`,
        createdAt: null,
        updatedAt: null,
        model: "service",
        serviceCode: "SUB-202001-00001",
        serviceName: "왓챠",
        servicSummary: "국내외 여러가지 미디어를 즐길 수 있는 스트리밍 서비스",
        serviceSqaureLogoUrl: "https://subping-assets.s3.ap-northeast-2.amazonaws.com/serviceLogo/watcha.png",
        serviceRating: 0.00,
        serviceTags: ["미디어", "OTT"],
        serviceMinPrice: 23800
    }
]

export const handler: APIGatewayProxyHandler = async (event, _context) => {
    try {
        const serviceModel: ServiceModel = serviceList[0];
        serviceModel['createdAt'] = new Date().toISOString();
        serviceModel['updatedAt'] = new Date().toISOString();

        const subpingDDB = new SubpingDDB(process.env.subpingTable);
        const controller = subpingDDB.getController();

        await controller.create<ServiceModel>(serviceModel);
    }

    catch (e) {
        console.log(e);
        return failure({
            success: false,
            message: "MakeServiceException"
        })
    }
}

