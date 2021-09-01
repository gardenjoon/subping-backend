import SubpingRDB, { Repository } from "subpingrdb";

import { APIGatewayProxyHandler } from 'aws-lambda';
import { success, failure } from "../../libs/response-lib";

export const handler: APIGatewayProxyHandler = async (event, _context) => {
    try {
        const userEmail = event.headers.email;
        const subpingRDB = new SubpingRDB();
        const connection = await subpingRDB.getConnection("dev");

        let unReadCount = 0;

        const alarmRepository = connection.getCustomRepository(Repository.Alarm);
        const userAlarms = await alarmRepository.findUserAlarms(userEmail);

        userAlarms.map(item => {
            if(!item.read) {
                unReadCount += 1;
            }
        });
       
        return success({
            success: true,
            message: {
                "alarms": userAlarms,
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