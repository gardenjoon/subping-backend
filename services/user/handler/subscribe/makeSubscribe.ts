import SubpingRDB, { Entity, Repository } from "subpingrdb";

import { APIGatewayProxyHandler } from 'aws-lambda';
import { success, failure } from "../../libs/response-lib";

export const handler: APIGatewayProxyHandler = async (event, _context) => {
    try {
        const body = JSON.parse(event.body || "");
        const userId = event.headers.id;

        const { userCard, period } = body;

        const subpingRDB = new SubpingRDB();
        const connection = await subpingRDB.getConnection("dev");

        const subscribeRP = connection.getCustomRepository(Repository.Subscribe);

        const currentDate = new Date();

        const subscribeModel = new Entity.Subscribe();
        subscribeModel.user = userId;
        subscribeModel.userCard = userCard;
        subscribeModel.subscribeDate = currentDate;
        subscribeModel.expiredDate = null;
        subscribeModel.reSubscribeDate = null;
        subscribeModel.period = period;
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