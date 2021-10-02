import SubpingRDB, { Entity } from "subpingrdb";
import  * as moment from "moment-timezone";

import { APIGatewayProxyHandler } from 'aws-lambda';
import { success, failure } from "../../libs/response-lib";

const makeHour = (hour: Number) => {
    let standardHour: string;
    return standardHour = 
            (3 <= hour && hour < 9) ? "03:00"
        :   (9 <= hour && hour < 15) ? "09:00"
        :   (15 <= hour && hour < 21) ? "15:00"
        :   "21:00"
}
export const handler: APIGatewayProxyHandler = async (event, _context) => {
    try {
        const body = JSON.parse(event.body || "");

        const { categories, tags, periods, seller, name, type, serviceLogoUrl, summary } = body;

        const subpingRDB = new SubpingRDB();
        const connection = await subpingRDB.getConnection("dev");

        const serviceModel = new Entity.Service();
        const serviceEventModel = new Entity.ServiceEvent();
        const serviceCategoryModel = new Entity.ServiceCategory();
        const serviceTagModel = new Entity.ServiceTag();
        const sellerModel = new Entity.Seller();
        const servicePeriodModel = new Entity.ServicePeriod();

        sellerModel.id = seller;

        serviceModel.seller = sellerModel;
        serviceModel.name = name;
        serviceModel.type = type;
        serviceModel.serviceLogoUrl = serviceLogoUrl;
        serviceModel.summary = summary;
        serviceModel.customizable = true;

        const currentTime = moment();
        const currentHour = makeHour(currentTime.hours());

        serviceEventModel.date = currentTime.format("YYYY-MM-DD");
        serviceEventModel.time = currentHour;

        const queryRunner = connection.createQueryRunner();

        try {
            await queryRunner.startTransaction();

            await queryRunner.manager.save(serviceModel);

            serviceEventModel.service = serviceModel;

            await queryRunner.manager.save(serviceEventModel);

            for(const category of categories) {
                const categoryModel = new Entity.Category();
                categoryModel.name = category
                serviceCategoryModel.service = serviceModel;
                serviceCategoryModel.category = categoryModel;

                await queryRunner.manager.save(serviceCategoryModel);
            }

            for(const tag of tags) {
                serviceTagModel.service = serviceModel;
                serviceTagModel.tag = tag;

                await queryRunner.manager.save(serviceTagModel);
            }

            for (const period of periods) {
                servicePeriodModel.service = serviceModel;
                servicePeriodModel.period = period;

                await queryRunner.manager.save(servicePeriodModel)
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

