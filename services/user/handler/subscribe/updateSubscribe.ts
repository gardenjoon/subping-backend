import SubpingRDB, { Repository } from "subpingrdb";

import * as moment from "moment-timezone";

import { APIGatewayProxyHandler } from 'aws-lambda';
import { success, failure } from "../../libs/response-lib";

export const handler: APIGatewayProxyHandler = async (event, _context) => {
    try {
        const body = JSON.parse(event.body || "");
        const userId = event.headers.id;

        const { productId } = body;

        const subpingRDB = new SubpingRDB();
        const connection = await subpingRDB.getConnection("dev");
        const repository = connection.getCustomRepository(Repository.Subscribe);

        const userSubscribeProduct = await repository.getOneSubscribe(userId, productId);

        const currentDate = new Date();

        await repository.updateSubscribe(userSubscribeProduct[0].id, currentDate);

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
        });
    }
}