import SubpingRDB, { Repository, Entity } from "subpingrdb"

import { APIGatewayProxyHandler } from 'aws-lambda';
import { success, failure } from "../../libs/response-lib";

export const handler: APIGatewayProxyHandler = async (event, _context) => {
    try {
        const body = JSON.parse(event.body || "");
        const userId = event.headers.id;

        const subpingRDB = new SubpingRDB();
        const connection = await subpingRDB.getConnection("dev");
        const alarmRepository = connection.getCustomRepository(Repository.Alarm);
        
        const alarmModel = new Entity.Alarm();
        alarmModel.user = userId;
        alarmModel.type = body.type;
        alarmModel.title = body.title;
        alarmModel.content = body.content;
        alarmModel.read = false;
        await alarmRepository.saveAlarm(alarmModel)

        return success({
            success: true,
            message: "MakeAlarmSuccess"
        });
    }

    catch (e) {
        console.log(e);
        return failure({
            success: false,
            message: "MakeAlarmException"
        })
    }
}