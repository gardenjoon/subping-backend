import AlarmModel from "subpingddb/model/subpingTable/alarm"
import { APIGatewayProxyHandler } from 'aws-lambda';
import SubpingDDB from "subpingddb";

import { success, failure } from "../../libs/response-lib";

export const handler: APIGatewayProxyHandler = async (event, _context) => {
    try {
        const header = event.headers;
        const PK = header.email;
        const subpingDDB = new SubpingDDB(process.env.subpingTable);
        const controller = subpingDDB.getController();
        
        console.log(PK);
        
        let unReadCount = 0;

        const alarms: AlarmModel[] = (await controller.read("model-PK-Index", "alarm", PK)).Items;
        
        alarms.forEach(item => {
            if(!item.read) unReadCount += 1;
        })

        return success({
            success: true,
            message: {
                "alarms": alarms,
                "unReadCount": unReadCount
            }
        });
    }

    catch (e) {
        console.log(e);
        return failure({
            success: false,
            message: "GetAlarmException"
        })
    }
}
