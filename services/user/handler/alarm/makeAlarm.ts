import SubpingRDB, { Repository, Entity } from "subpingrdb"

import { APIGatewayProxyHandler } from 'aws-lambda';
import { success, failure } from "../../libs/response-lib";

export const handler: APIGatewayProxyHandler = async (event, _context) => {
    try {
        const subpingRDB = new SubpingRDB();
        const connection = await subpingRDB.getConnection("dev");
        const alarmRepository = connection.getCustomRepository(Repository.Alarm)
        
        const alarmModel = new Entity.Alarm();
        alarmModel.user = "dlwjdwls6504@gmail.com"
        alarmModel.type = "info"
        alarmModel.title = "이정진 전용"
        alarmModel.content = "정진님 오늗도 1정진 했어!\n-다일-"
        alarmModel.read = true
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
