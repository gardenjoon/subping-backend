import SubpingRDB, { Repository } from "subpingrdb";
import SubpingDDB from "../../libs/subpingddb";

import * as moment from "moment-timezone";

import { APIGatewayProxyHandler } from 'aws-lambda';
import { success, failure } from "../../libs/response-lib";

export const handler: APIGatewayProxyHandler = async (event, _context) => {
    try {
        // const userId = event.headers.id;
        const body = JSON.parse(event.body || "");
        
        const { limit, page } = body;

        const subpingRDB = new SubpingRDB();
        const connection = await subpingRDB.getConnection("dev");

        const currentTime = moment().utc();

        const subpingDDB = new SubpingDDB(process.env.subpingTable);
        const controller = subpingDDB.getController();
        const hotChartTime = (await controller.read("PK-SK-Index", "hotChartTime")).Items[0]
        const serviceRepository = connection.getCustomRepository(Repository.Service)
        const serviceRank = await serviceRepository.getServices({
            tag: true,
            rank: {
                standardDate: hotChartTime.date,
                standardTime: hotChartTime.time,
            },
            pagination: {
                limit: limit,
                page: page,
                standardTime: currentTime.toISOString()
            }
        });
        const standardTime = moment(hotChartTime.date+hotChartTime.time, "YYYY-MM-DDThh").add(9, "hours");
        const resultDate = standardTime.format("YYYY-MM-DD")
        const resultTime = standardTime.format("hh:00")

        if(serviceRank.length === 0) {
            return failure({
                success: false,
                message: "NoRankException"
            });
        }

        else {
            return success({
                success: true,
                message: {
                    date: resultDate,
                    time: resultTime,
                    serviceRank: serviceRank
                }
            });
        }
    }

    catch (e) {
        console.log(e);
        return failure({
            success: false,
            message: "CurrentHotChartException"
        });
    }
}