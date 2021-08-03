import SubpingRDB, { Repository } from "subpingrdb";
import SubpingDDB from "../../libs/subpingddb";

import { APIGatewayProxyHandler } from 'aws-lambda';

import { success, failure } from "../../libs/response-lib";

export const handler: APIGatewayProxyHandler = async (event, _context) => {
    try {
        const subpingRDB = new SubpingRDB();
        const connection = await subpingRDB.getConnection("dev");

        const subpingDDB = new SubpingDDB(process.env.subpingTable);
        const controller = subpingDDB.getController();
        const hotChartTime = (await controller.read("PK-SK-Index", "hotChartTime")).Items[0]

        const rankRepository = connection.getCustomRepository(Repository.ServiceRank)
        const serviceRank = await rankRepository.findAllServiceRank(hotChartTime.date, hotChartTime.time);

        if(serviceRank.length === 0) {
            return failure({
                success: false,
                message: "NoRankException"
            })
        }

        else {
            return success({
                success: true,
                message: {
                    date: hotChartTime.date,
                    time: hotChartTime.time,
                    serviceRank: serviceRank
                }
            })
        }
    }

    catch (e) {
        console.log(e);
        return failure({
            success: false,
            message: "CurrentHotChartException"
        })
    }
}
