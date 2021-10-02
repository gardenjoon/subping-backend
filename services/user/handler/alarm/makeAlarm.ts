import SubpingRDB, { Repository, Entity } from "subpingrdb"

import { APIGatewayProxyHandler } from 'aws-lambda';
import { success, failure } from "../../libs/response-lib";

export const handler: APIGatewayProxyHandler = async (event, _context) => {
    try {
        const body = JSON.parse(event.body || "");
        const userId = event.headers.id;

        const { title, type, content } = body;

        const subpingRDB = new SubpingRDB();
        const connection = await subpingRDB.getConnection("dev");
        const alarmRepository = connection.getCustomRepository(Repository.Alarm);

        const userModel = new Entity.User();
        userModel.id = userId
        
        const alarmModel = new Entity.Alarm();
        alarmModel.user = userModel;
        alarmModel.type = type;
        alarmModel.title = title;
        alarmModel.content = content;
        await alarmRepository.createAlarm(alarmModel)

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