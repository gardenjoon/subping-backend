import SubpingRDB, { Repository } from "subpingrdb"
import { APIGatewayProxyHandler } from 'aws-lambda';

import { success, failure } from "../../libs/response-lib";

export const handler: APIGatewayProxyHandler = async (event, _context) => {
    try {
        // const header = event.headers;
        // const PK = header.email;

        const subpingRDB = new SubpingRDB();
        const connection = await subpingRDB.getConnection("dev");
        const alarmRepository = connection.getCustomRepository(Repository.Alarm);
        
        let unReadCount = 0;

        const alarms = await alarmRepository.findUserAlarms("dlwjdwls6504@gmail.com")//PK입력

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
