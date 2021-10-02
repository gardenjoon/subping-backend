import SubpingRDB, { Entity, Repository } from "subpingrdb";

import * as moment from "moment-timezone";

import { APIGatewayProxyHandler } from 'aws-lambda';
import { success, failure } from "../../libs/response-lib";

export const handler: APIGatewayProxyHandler = async (event, _context) => {
    try {
        const response = {}
        const userId = "5c1547f2-1049-4d64-8a0a-3140931127e9";

        const subpingRDB = new SubpingRDB();
        const connection = await subpingRDB.getConnection("dev");
        const subscribeRepository = connection.getCustomRepository(Repository.Subscribe);

        const currentMoment = moment.tz("Asia/Seoul")
        .hour(0)
        .minute(0)
        .second(0)
        .millisecond(0);
        const startMoment = moment(currentMoment)
            .startOf("M")
        const endMoment = moment(currentMoment)
            .add(1,"M")
            .endOf("M")
        const currentMonth = startMoment.format("MM");
        const nextMonth = endMoment.format("MM");

        response[currentMonth] = [];
        response[nextMonth] = [];

        const subscribes = await subscribeRepository.querySubscribes(userId, {
            payment: {
                startDate: startMoment.toDate(),
                endDate: endMoment.toDate(),
            },
            service: true
        });

        for(const subscribe of subscribes) {
            const { payments, expiredDate, reSubscribeDate } = subscribe;

            for(const payment of payments) {
                const { paymentDate, paymentComplete } = payment;
                const schedule = {
                    "serviceId": subscribe.subscribeItems[0].product.serviceId,
                    "serviceLogoUrl": subscribe.subscribeItems[0].product.service.serviceLogoUrl;
                    "status": paymentComplete ? "결제 완료" : "결제 예정"
                }

                const paymentMoment = moment(paymentDate);
                const paymentMonth = paymentMoment.format("MM");

                if(paymentMonth === currentMonth || paymentMonth === nextMonth) {
                    response[paymentMonth].push(schedule)
                }
            }
        }

        return success({
            success: true,
            message: subscribes
        })

    }

    catch (e) {
        console.log(e)
    }
}