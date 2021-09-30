import SubpingRDB, { Repository } from "subpingrdb";

import { APIGatewayProxyHandler } from 'aws-lambda';
import { success, failure } from "../../libs/response-lib";

export const handler: APIGatewayProxyHandler = async (event, _context) => {
    try {
        const userId = event.headers.id;

        const subpingRDB = new SubpingRDB();
        const connection = await subpingRDB.getConnection("dev");
        const alarmRepository = connection.getCustomRepository(Repository.Alarm);

        const unReadAlarms = await alarmRepository.queryUnreadAlarms(userId)

        for (const unReadAlarm of unReadAlarms){
            await alarmRepository.updateAlarmToRead(unReadAlarm.id);
        }

        return success({
            success: true,
            message: "ReadAlarmSuccess"
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