import SubpingRDB, { Entity, Repository } from "subpingrdb";
import SubpingDDB from "../../libs/subpingddb";
import HotChartTimeModel from "../../libs/subpingddb/model/subpingTable/hotChartTime";

import moment from "moment-timezone";

import { APIGatewayProxyHandler } from "aws-lambda";
import { success, failure } from "../../libs/response-lib";

export const handler: APIGatewayProxyHandler = async (_event, _context) => {
    const makeHour = (hour: number) => {
        let standardHour = 
            3 <= hour && hour < 9 ? "03:00"
        :   9 <= hour && hour < 15 ? "09:00"
        :   15 <= hour && hour < 21 ? "15:00"
        : "21:00";

        return standardHour
    };

    const setTime = () => {
        const time = {
            currentHour: null,
            currentDate: null,
            standardHour: null,
            standardDate: null,
        };

        const currentTime = moment();

        time.currentHour = makeHour(currentTime.hours());
        time.currentDate = currentTime.format("YYYY-MM-DD");

        let standardTime = currentTime.subtract(6, "hours");
        time.standardHour = makeHour(standardTime.hours());
        time.standardDate = standardTime.format("YYYY-MM-DD");

        return time;
    };

    try {
        const subpingDDB = new SubpingDDB(process.env.subpingTable);
        const controller = subpingDDB.getController();
        const subpingRDB = new SubpingRDB();
        const connection = await subpingRDB.getConnection("dev");

        const time = setTime();

        const serviceRepository = connection.getCustomRepository(Repository.Service);
        const allServices = await serviceRepository.queryAllServices();

        const serviceEventRepository = connection.getCustomRepository(Repository.ServiceEvent);
        const servicesWithEvent = await serviceEventRepository.queryServiceEvents(time.standardDate, time.standardHour);

        const serviceEventModel = new Entity.ServiceEvent();
        const serviceRankModel = new Entity.ServiceRank();

        serviceEventModel.date = time.currentDate;
        serviceEventModel.time = time.currentHour;

        serviceRankModel.date = time.currentDate;
        serviceRankModel.time = time.currentHour;

        const HotChartTimeModel: HotChartTimeModel = {
            PK: "hotChartTime",
            SK: "hotChartTime",
            createdAt: null,
            updatedAt: null,
            model: "hotChartTime",
            date: time.currentDate,
            time: time.currentHour
        };

        const queryRunner = connection.createQueryRunner();
        try {
            await queryRunner.startTransaction();

            for (const [index, service] of servicesWithEvent.entries()) {
                const serviceModel = new Entity.Service();
                serviceModel.id = service.serviceId;

                serviceRankModel.service = serviceModel;
                serviceRankModel.rank = index + 1;

                await queryRunner.manager.save(serviceRankModel);
            }

            for (const service of allServices) {
                const serviceModel = new Entity.Service();
                serviceModel.id = service.id;

                serviceEventModel.service = serviceModel;
                await queryRunner.manager.save(serviceEventModel);
            }

            await controller.create<HotChartTimeModel>(HotChartTimeModel);

            await queryRunner.commitTransaction();
        } catch (e) {
            console.log(e);
            await queryRunner.rollbackTransaction();
        } finally {
            await queryRunner.release();
        }

        return success({
            success: true,
            message: "cronMakeRankSuccess",
        });
    } 
    catch (e) {
        console.log(e);
        return failure({
            success: false,
            message: "cronMakeRankException",
        });
    }
};
