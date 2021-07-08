import SubpingDDB from "subpingddb";
import ServiceModel from "subpingddb/model/subpingTable/service";
import ServiceRankModel from "subpingddb/model/subpingTable/serviceRank";
import HotChartTimeModel from "subpingddb/model/subpingTable/hotChartTime";
import ServiceEventModel from "subpingddb/model/subpingTable/serviceEvent";

import { APIGatewayProxyHandler } from 'aws-lambda';

import { success, failure } from "../../libs/response-lib";

export const handler:APIGatewayProxyHandler  = async (event, _context) => {
    try {
        const subpingDDB = new SubpingDDB(process.env.subpingTable);
        const controller = subpingDDB.getController();
        
        // serviceEvent에서 정보를 읽어 rating을 생성
        const serviceEvent: ServiceEventModel[] = (await controller.read("model-PK-Index", "event")).Items;

        //내림차순 정렬
        serviceEvent.sort((a:ServiceEventModel, b:ServiceEventModel) => {
            return (b.dailyReviews + b.dailySubscribers + b.dailyWatchers) - (a.dailyReviews + a.dailySubscribers + a.dailyWatchers);
        });
        
        let time = new Date().getHours()-9;
        
        if (6 <= time && time < 12) {
            time = 6;
        }

        else if (12 <= time && time < 18) {
            time = 12;
        }

        else if (18 <= time && time < 24) {
            time = 18;
        }
        else {
            time = 24;
        }

        serviceEvent.forEach(async (element, index) => {
            const service: ServiceModel = (await controller.read("model-PK-Index", "service", element.PK)).Items[0]
            const ttlHour = 24;
            const ttl = (Math.round(Date.now() / 1000) + ttlHour * 60 * 60).toString();
            const serviceRankModel: ServiceRankModel = {
                ...service,
                PK: element.PK,
                SK: `rank#${time}`,
                createdAt: null,
                updatedAt: null,
                model: "rank",
                rank: index + 1,
                time: `${time}`,
                ttl: ttl
            }

            await controller.create<ServiceRankModel>(serviceRankModel);
        });

        const HotChartTimeModel: HotChartTimeModel = {
            PK: "hotChartTime",
            SK: "hotChartTime",
            createdAt: null,
            updatedAt: null,
            model: "hotChartTime",
            time: time
        }

        await controller.create<HotChartTimeModel>(HotChartTimeModel);

        return success({
            success: true,
            message: 'All MakeRating is successfully updated'
        })
    }

    catch (e) {
      console.log(e);
      return failure({
          success: false,
          message: "cronMakeRatingException"
      })
    }
}



