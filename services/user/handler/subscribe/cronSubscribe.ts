import SubpingRDB, { Entity, Repository } from "subpingrdb";

import * as moment from "moment-timezone";

import { APIGatewayProxyHandler } from 'aws-lambda';
import { success, failure } from "../../libs/response-lib";
import SubpingPayment from "../../libs/subpingPayment";

export const handler: APIGatewayProxyHandler = async (event, _context) => {
    try {
        // const today = moment.tz("Asia/Seoul").format("YYYY-MM-DD");
        const today = "2021-11-25";

        const subpingSubscribe = new SubpingPayment();
        const subpingRDB = new SubpingRDB();
        const connection = await subpingRDB.getConnection("dev");
        const paymentRepository = connection.getCustomRepository(Repository.Payment);
        const subscribeRepository = connection.getCustomRepository(Repository.Subscribe);

        const paymentListOfDate = await paymentRepository.findPaymentListOfDate(today);

        for (const payment of paymentListOfDate) {
            await subpingSubscribe.pay(payment);
        }

        return success({
            success: true,
            message: "CronSubscribeDone"
        })

    }

    catch (e) {
        console.log(e)
    }
}