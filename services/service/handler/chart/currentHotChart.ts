import SubpingRDB, { Repository } from "subpingrdb";
import SubpingDDB from "../../libs/subpingddb";
import * as moment from "moment-timezone";
import { APIGatewayProxyHandler } from 'aws-lambda';
import { success, failure } from "../../libs/response-lib";

export const handler: APIGatewayProxyHandler = async (event, _context) => {
    try {
        // const PK = event.headers.email;
        const body = JSON.parse(event.body || "");
        
        const { limit, page } = body;

        const subpingRDB = new SubpingRDB();
        const connection = await subpingRDB.getConnection("dev");

        const currentTime = moment.tz("Asia/Seoul");

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
                    date: hotChartTime.date,
                    time: hotChartTime.time,
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