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
        const unReadAlarms: AlarmModel[] = 
            (await controller.readWithFilter("model-PK-Index", PK, null, {read: false})).Items;

        for(const unReadAlarm of unReadAlarms) {
            await controller.update(unReadAlarm.PK, unReadAlarm.SK, {
                read: true
            });
        }

        return success({
            success: true,
            message: "done"
        });
    }

    catch (e) {
        console.log(e);
        return failure({
            success: false,
            message: "ReadAlarmException"
        })
    }
}
