import SubpingRDB, { Entity, Repository } from "subpingrdb";

import { APIGatewayProxyHandler } from 'aws-lambda';
import { success, failure } from "../../libs/response-lib";

import  * as moment from "moment-timezone";

export const handler: APIGatewayProxyHandler = async (event , _context) => {
    try {
        const subpingRDB = new SubpingRDB();
        const connection = await subpingRDB.getConnection("dev");
        const userRP = connection.getCustomRepository(Repository.User)
        const subscribeRP = connection.getCustomRepository(Repository.Subscribe)
        const productRP = connection.getCustomRepository(Repository.Product)
        const user = await userRP.findOneUser("jsw9808@gmail.com");
        const product = await productRP.findOneProduct("b3bda359-df7c-4615-bb7e-b8a1e0c43887")

        const currentTime = moment.tz("Asia/Seoul");
        const currentDate = currentTime.format("YYYY-MM-DD");

        const subscribeModel = new Entity.Subscribe();
        subscribeModel.user = user.email;
        subscribeModel.product = product.id;
        subscribeModel.period = 30;
        subscribeModel.subscribeDate = currentDate;
        subscribeModel.expiredDate = null;

        await subscribeRP.saveSubscribe(subscribeModel);

        return success({
            success: true,
            message: "makeUserSubscribeSuccess"
        })
    }

    catch (e) {
        console.log(e);
        return failure({
            success: false,
            message: "UserSubscribeException"
        })
    }
} 