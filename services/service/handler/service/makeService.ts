import SubpingRDB, { Repository, Entity } from "subpingrdb";

import { APIGatewayProxyHandler } from 'aws-lambda';
import { success, failure } from "../../libs/response-lib";


export const handler: APIGatewayProxyHandler = async (event, _context) => {
    try {
        const subpingRDB = new SubpingRDB();
        const connection = await subpingRDB.getConnection("dev");
        
        const serviceModel = new Entity.Service();
        const serviceEventModel = new Entity.ServiceEvent();
        
        serviceModel.seller = "wonjoon@joiple.co"
        serviceModel.name = "test";
        serviceModel.type = "online"
        serviceModel.serviceLogoUrl = "https://subping-assets.s3.ap-northeast-2.amazonaws.com/serviceLogo/watcha.png"
        serviceModel.summary = "test";

        serviceEventModel.date = new Date();
        serviceEventModel.time = "18:00";

        const queryRunner = connection.createQueryRunner();

        queryRunner.startTransaction();
        await queryRunner.manager.getCustomRepository(Repository.Service).save(serviceModel);

        serviceEventModel.service = serviceModel.id;

        await queryRunner.manager.getCustomRepository(Repository.ServiceEvent).save(serviceEventModel);
        queryRunner.commitTransaction();

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

