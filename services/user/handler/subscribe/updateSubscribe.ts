import SubpingRDB, { Repository } from "subpingrdb";

import { APIGatewayProxyHandler } from 'aws-lambda';
import { success, failure } from "../../libs/response-lib";
import * as moment from "moment-timezone";


export const handler: APIGatewayProxyHandler = async (event, _context) => {
    try {
        const subpingRDB = new SubpingRDB();
        const connection = await subpingRDB.getConnection("dev");
        const repository = connection.getCustomRepository(Repository.Subscribe);

        const updateExpiration = await repository.getOneSubscribe("jsw9808@gmail.com", "28864f6c-44c7-4dc9-9bce-e81d1b173aa9")

        const currentTime = moment.tz("Asia/Seoul");
        const currentDate = currentTime.format("YYYY-MM-DD");
        
        await repository.updateSubscribe(updateExpiration[0].id, currentDate)


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
