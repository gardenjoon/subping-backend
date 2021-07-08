import SubpingDDB from "subpingddb";
import ServiceRankModel from "subpingddb/model/subpingTable/serviceRank";
import HotChartTimeModel from "subpingddb/model/subpingTable/hotChartTime";

import { APIGatewayProxyHandler } from 'aws-lambda';

import { success, failure } from "../../libs/response-lib";

export const handler: APIGatewayProxyHandler = async (event, _context) => {
    try {
        const subpingDDB = new SubpingDDB(process.env.subpingTable);
        const controller = subpingDDB.getController();
        const hotChartTime: HotChartTimeModel = (await controller.read("PK-SK-Index", "hotChartTime")).Items[0]
        const time = hotChartTime.time;
        const serviceRank = (await controller.read("SK-PK-Index", `rank#${time}`)).Items;
        
        if(serviceRank.length === 0) {
            return failure({
                success: false,
                message: "NoRankException"
            })
        }

        else {
            serviceRank.sort((a: ServiceRankModel, b: ServiceRankModel) => {
                return a.rank - b.rank
            });
            
            return success({
                success: true,
                message: serviceRank
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
