import SubpingRDB, { Entity } from "subpingrdb";
import  * as moment from "moment-timezone";

import { APIGatewayProxyHandler } from 'aws-lambda';
import { success, failure } from "../../libs/response-lib";

const makeHour = (hour: Number) => {
    let standardHour:string;
    return standardHour = 
            (3 <= hour && hour < 9) ? "03:00"
        :   (9 <= hour && hour < 15) ? "09:00"
        :   (15 <= hour && hour < 21) ? "15:00"
        :   "21:00"
}
export const handler: APIGatewayProxyHandler = async (event, _context) => {
    try {
        const body = JSON.parse(event.body || "");

        const { categories, tags, seller, name, type, serviceLogoUrl, summary } = body;

        const subpingRDB = new SubpingRDB();
        const connection = await subpingRDB.getConnection("dev");

        const serviceModel = new Entity.Service();
        const serviceEventModel = new Entity.ServiceEvent();
        const serviceCategoryModel = new Entity.ServiceCategory();
        const serviceTagModel = new Entity.ServiceTag();

        serviceModel.seller = seller;
        serviceModel.name = name;
        serviceModel.type = type;
        serviceModel.serviceLogoUrl = serviceLogoUrl;
        serviceModel.summary = summary;

        const currentTime = moment();
        const currentHour = makeHour(currentTime.hours());

        serviceEventModel.date = currentTime.format("YYYY-MM-DD");
        serviceEventModel.time = currentHour;

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
        });
    } 

    catch (e) {
        console.log(e);
        return failure({
            success: false,
            message: "MakeServiceException"
        });
    }
}

