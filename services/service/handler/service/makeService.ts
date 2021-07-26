import SubpingRDB, { Repository, Entity } from "subpingrdb";
import  * as moment from "moment-timezone";

import { APIGatewayProxyHandler } from 'aws-lambda';
import { success, failure } from "../../libs/response-lib";


export const handler: APIGatewayProxyHandler = async (event, _context) => {
    try {
        const subpingRDB = new SubpingRDB();
        const connection = await subpingRDB.getConnection("dev");
        
        const categories = ['미디어'];

        const serviceModel = new Entity.Service();
        const serviceEventModel = new Entity.ServiceEvent();
        const serviceCategoryModel = new Entity.ServiceCategory();
        
        serviceModel.seller = "wonjoon@joiple.co"
        serviceModel.name = "test";
        serviceModel.type = "online"
        serviceModel.serviceLogoUrl = "https://subping-assets.s3.ap-northeast-2.amazonaws.com/serviceLogo/watcha.png"
        serviceModel.summary = "test";

        const currentTime = moment.tz("Asia/Seoul");
        const hour = currentTime.hour();

        let standardHour = null;

        if (6 <= hour && hour < 12) {
            standardHour = "06:00";
        }

        else if (12 <= hour && hour < 18) {
            standardHour = "12:00";
        }

        else if (18 <= hour && hour < 24) {
            standardHour = "18:00";
        }
        else {
            standardHour = "24:00";
        }

        serviceEventModel.date = currentTime.toDate();
        serviceEventModel.time = standardHour;

        const queryRunner = connection.createQueryRunner();

        queryRunner.startTransaction();

        await queryRunner.manager.getCustomRepository(Repository.Service).save(serviceModel);

        serviceEventModel.service = serviceModel.id;

        await queryRunner.manager.getCustomRepository(Repository.ServiceEvent).save(serviceEventModel);
        
        for(const category of categories) {
            serviceCategoryModel.service = serviceModel.id;
            serviceCategoryModel.category = category;

            await queryRunner.manager.getCustomRepository(Repository.ServiceCategory).save(serviceCategoryModel);
        }

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

