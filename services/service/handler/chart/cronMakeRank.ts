import SubpingRDB, { Entity, Repository } from "subpingrdb";
import SubpingDDB from "../../libs/subpingddb";
import HotChartTimeModel from "../../libs/subpingddb/model/subpingTable/hotChartTime";

import * as moment from "moment-timezone";

import { APIGatewayProxyHandler } from 'aws-lambda';
import { success, failure } from "../../libs/response-lib";

export const handler:APIGatewayProxyHandler  = async (_event, _context) => {
    const makeHour = (hour: Number) => {
        let standardHour = null;
        
        if (3 <= hour && hour < 9) {
            standardHour = "03:00";
        }
        
        else if (9 <= hour && hour < 15) {
            standardHour = "09:00";
        }
        
        else if (15 <= hour && hour <= 21) {
            standardHour = "15:00";
        }

        else {
            standardHour = "21:00";
        }

        return standardHour;
    }
    const setTime = () => {
        const time = {
            currentHour : null,
            currentDate : null,
            standardHour : null,
            standardDate : null
        }

        const currentTime = moment().utc();
        time.currentHour = makeHour(currentTime.hours())
        time.currentDate = currentTime.format("YYYY-MM-DD")

        let standardTime = currentTime.subtract(6, "hours");
        time.standardHour = makeHour(standardTime.hours());

        if(time.standardHour == "21:00") {
            standardTime = currentTime.subtract(1, "days");
        }

        time.standardDate = standardTime.format("YYYY-MM-DD");
        return time
    }
    try {
        const subpingRDB = new SubpingRDB();
        const connection = await subpingRDB.getConnection("dev");

        const time = setTime()

        const eventRepository = connection.getCustomRepository(Repository.ServiceEvent);

        // service와 serviceEvent를 조인하고 정보를 읽어 rating을 생성
        const rankRepository = connection.getRepository(Entity.ServiceRank);

        const eventModelForRank = await eventRepository.getServiceEvents(time.standardDate, time.standardHour);
        for (const [index, element] of eventModelForRank.entries()) {
            const serviceRankModel = new Entity.ServiceRank();
            serviceRankModel.service = element.serviceId;
            serviceRankModel.date = time.currentDate;
            serviceRankModel.time = time.currentHour;
            serviceRankModel.rank = index+1;
            await rankRepository.save(serviceRankModel);
        }

        // 매 standardHour마다 serviceEvent 생성
        const serviceRepository = connection.getCustomRepository(Repository.Service);
        const allServices = await serviceRepository.findAllService();

        for (const element of allServices){
            const serviceEventModel = new Entity.ServiceEvent;
            serviceEventModel.service = element.id;
            serviceEventModel.date = time.currentDate;
            serviceEventModel.time = time.currentHour;
            serviceEventModel.subscribe = 0;
            serviceEventModel.review = 0;
            serviceEventModel.view = 0;
            // await eventRepository.saveServiceEvent(serviceEventModel);
        };

        //핫차트 기준시간 모델 생성
        const subpingDDB = new SubpingDDB(process.env.subpingTable);
        const controller = subpingDDB.getController();

        const HotChartTimeModel: HotChartTimeModel = {
            PK: "hotChartTime",
            SK: "hotChartTime",
            createdAt: null,
            updatedAt: null,
            model: "hotChartTime",
            date: time.currentDate,
            time: time.currentHour
        };
        // await controller.create<HotChartTimeModel>(HotChartTimeModel);

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
    }
}