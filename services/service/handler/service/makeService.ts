import SubpingRDB, { Repository, Entity } from "subpingrdb";
import  * as moment from "moment-timezone";

import { APIGatewayProxyHandler } from 'aws-lambda';
import { success, failure } from "../../libs/response-lib";


export const handler: APIGatewayProxyHandler = async (event, _context) => {
    try {
        const subpingRDB = new SubpingRDB();
        const connection = await subpingRDB.getConnection("dev");
        
        const categories = ['사회'];
        const tags = ["tag#1", "tag#2"];

        const serviceModel = new Entity.Service();
        const serviceEventModel = new Entity.ServiceEvent();
        const serviceCategoryModel = new Entity.ServiceCategory();
        const serviceTagModel = new Entity.ServiceTag();

        serviceModel.seller = "wonjoon@joiple.co"
        serviceModel.name = "test2";
        serviceModel.type = "online"
        serviceModel.serviceLogoUrl = "https://subping-assets.s3.ap-northeast-2.amazonaws.com/serviceLogo/watcha.png"
        serviceModel.summary = "test2";

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
        
        try {
            await queryRunner.startTransaction();

            await queryRunner.manager.save(serviceModel);
            
            serviceEventModel.service = serviceModel.id;
    
            await queryRunner.manager.save(serviceEventModel);
            
            for(const category of categories) {
                serviceCategoryModel.service = serviceModel.id;
                serviceCategoryModel.category = category;
    
                await queryRunner.manager.save(serviceCategoryModel);
            }

            for(const tag of tags) {
                serviceTagModel.service = serviceModel.id;
                serviceTagModel.tag = tag;

                await queryRunner.manager.save(serviceTagModel);
            }
    
            await queryRunner.commitTransaction();
        }
        catch(e) {
            console.log(e);
            await queryRunner.rollbackTransaction();
        }
        finally {
            await queryRunner.release();
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

