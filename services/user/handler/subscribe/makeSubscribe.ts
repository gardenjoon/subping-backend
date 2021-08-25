import SubpingRDB, { Entity, Repository } from "subpingrdb";

import  * as moment from "moment-timezone";

import { APIGatewayProxyHandler } from 'aws-lambda';
import { success, failure } from "../../libs/response-lib";

export const handler: APIGatewayProxyHandler = async (event, _context) => {
    try {
        const body = JSON.parse(event.body || "");
        const header = event.headers;
        const PK = header.email;

        const { productId, period } = body;

        const subpingRDB = new SubpingRDB();
        const connection = await subpingRDB.getConnection("dev");

        const subscribeRP = connection.getCustomRepository(Repository.Subscribe);

        const currentTime = moment.tz("Asia/Seoul");
        const currentDate = currentTime.format("YYYY-MM-DD");

        const subscribeModel = new Entity.Subscribe();
        subscribeModel.user = PK;
        subscribeModel.product = productId;
        subscribeModel.period = period;
        subscribeModel.subscribeDate = currentDate;
        subscribeModel.expiredDate = null;
        await subscribeRP.saveSubscribe(subscribeModel);

        return success({
            success: true,
            message: "makeUserSubscribeSuccess"
        });
    }

    catch (e) {
        console.log(e);
        return failure({
            success: false,
            message: "UserSubscribeException"
        });
    }
}