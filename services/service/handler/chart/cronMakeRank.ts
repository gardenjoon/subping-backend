import SubpingRDB, { Entity, Repository } from "subpingrdb";
import SubpingDDB from "subpingddb"
import HotChartTimeModel from "subpingddb/model/subpingTable/hotChartTime";

import * as moment from "moment-timezone";

import { APIGatewayProxyHandler } from 'aws-lambda';
import { success, failure } from "../../libs/response-lib";

export const handler:APIGatewayProxyHandler  = async (event, _context) => {
    const makeHour = (hour: Number) => {
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
        return standardHour;
    }

    try {
        const subpingRDB = new SubpingRDB();
        const connection = await subpingRDB.getConnection("dev");

        const currentTime = moment.tz("Asia/Seoul");
        const currentHour = makeHour(currentTime.hours());
        const currentDate = currentTime.format("YYYY-MM-DD");

        const standardTime = currentTime.subtract(6, "hours");
        const standardHour = makeHour(standardTime.hours());
        const standardDate = standardTime.format("YYYY-MM-DD")
        
        const eventRepository = connection.getCustomRepository(Repository.ServiceEvent)

        // service와 serviceEvent를 조인하고 정보를 읽어 rating을 생성
        const rankRepository = connection.getCustomRepository(Repository.ServiceRank)

        const eventModelForRank = await eventRepository.getServiceEvents(standardDate, standardHour);
        for (const [index, element] of eventModelForRank.entries()) {
            const serviceRankModel = new Entity.ServiceRank();
            serviceRankModel.service = element.service;
            serviceRankModel.date = currentDate;
            serviceRankModel.time = currentHour;
            serviceRankModel.rank = index+1;
            await rankRepository.saveServiceRank(serviceRankModel)
        }

        // 매 standardHour마다 serviceEvent 생성
        const serviceRepository = connection.getCustomRepository(Repository.Service)
        const allServices = await serviceRepository.findAllService();

        for (const element of allServices){
            const serviceEventModel = new Entity.ServiceEvent;
            serviceEventModel.service = element.id;
            serviceEventModel.date = currentDate;
            serviceEventModel.time = currentHour;
            serviceEventModel.subscribe = 0;
            serviceEventModel.review = 0;
            serviceEventModel.view = 0;
            await eventRepository.saveServiceEvent(serviceEventModel)
        }

        //핫차트 기준시간 모델 생성
        const subpingDDB = new SubpingDDB(process.env.subpingTable);
        const controller = subpingDDB.getController();

        const HotChartTimeModel: HotChartTimeModel = {
            PK: "hotChartTime",
            SK: "hotChartTime",
            createdAt: null,
            updatedAt: null,
            model: "hotChartTime",
            date: currentDate,
            time: currentHour
        };
        await controller.create<HotChartTimeModel>(HotChartTimeModel);

        return success({
            success: true,
            message: 'All MakeRank is successfully updated'
        });
    }

    catch (e) {
      console.log(e);
      return failure({
          success: false,
          message: "cronMakeRankException"
      });
    };
};