import AlarmModel from "subpingddb/model/subpingTable/alarm"
import { APIGatewayProxyHandler } from 'aws-lambda';
import SubpingRDB, { Repository } from "subpingrdb";

import { success, failure } from "../../libs/response-lib";

export const handler: APIGatewayProxyHandler = async (event, _context) => {
    try {
        const header = event.headers;
        const PK = header.email;

        const subpingRDB = new SubpingRDB();
        const connection = await subpingRDB.getConnection("dev")
        const alarmRepository = connection.getCustomRepository(Repository.Alarm);


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
