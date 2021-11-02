import SubpingRDB, { Entity, Repository } from "subpingrdb";

import * as moment from "moment-timezone";

import { APIGatewayProxyHandler } from 'aws-lambda';
import { success, failure } from "../../libs/response-lib";
import SubpingPayment from "../../libs/subpingPayment";

export const handler: APIGatewayProxyHandler = async (event, _context) => {
    try {
        const today = moment.tz("Asia/Seoul").format("YYYY-MM-DD");
        // const today = "2021-10-26";

        const subpingPayment = new SubpingPayment();
        const subpingRDB = new SubpingRDB();
        const connection = await subpingRDB.getConnection("dev");
        const paymentRepository = connection.getCustomRepository(Repository.Payment);

        const paymentListOfDate = await paymentRepository.queryPaymentListOfDate(today);

        console.log(paymentListOfDate);

        for (const payment of paymentListOfDate) {
            try {
                await subpingPayment.pay(payment);
            } catch(e) {
                console.log(e);
            }
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