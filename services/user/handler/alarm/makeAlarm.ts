import AlarmModel from "subpingddb/model/subpingTable/alarm"
import { APIGatewayProxyHandler } from 'aws-lambda';
import { v4 as uuidv4 } from 'uuid';
import SubpingDDB from "subpingddb";

import { success, failure } from "../../libs/response-lib";

export const handler: APIGatewayProxyHandler = async (event, _context) => {
    try {
        const ttlHour = 2400;
        const ttl = (Math.round(Date.now() / 1000) + ttlHour * 60 * 60);

        const alarm: AlarmModel = {
            PK: "dlwjdwls6504@gmail.com",
            SK: `alarm#${uuidv4()}`,
            createdAt: null,
            updatedAt: null,
            model: "alarm",
            title: "이정진 전용",
            content: "정진님 오늗도 5정진 했어!\n-다일-",
            read: false,
            type: "important",
            clickTo: "/home",
            ttl: ttl
        }

        const subpingDDB = new SubpingDDB(process.env.subpingTable);
        const controller = subpingDDB.getController();
        await controller.create<AlarmModel>(alarm);
        
        return success({
            success: true,
            message: "done"
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
