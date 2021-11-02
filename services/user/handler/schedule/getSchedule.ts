import SubpingRDB, { Entity, Repository } from "subpingrdb";

import * as moment from "moment-timezone";

import { APIGatewayProxyHandler } from 'aws-lambda';
import { success, failure } from "../../libs/response-lib";
import SubpingPayment from "../../libs/subpingPayment";

export const handler: APIGatewayProxyHandler = async (event, _context) => {
    try {
        const response = {}
        // const userId = "5c1547f2-1049-4d64-8a0a-3140931127e9";
        const userId = event.headers.id;

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
            .add(1, "M")
            .endOf("M")
        const currentMonth = startMoment.format("MM");
        const nextMonth = endMoment.format("MM");

        response[currentMonth] = {};
        response[nextMonth] = {};

        const subscribes = await subscribeRepository.querySubscribes(userId, {
            payment: {
                startDate: startMoment.toDate(),
                endDate: endMoment.toDate(),
            },
            service: true
        });

        for (const subscribe of subscribes) {
            const { payments, expiredDate, reSubscribeDate, period, subscribeItems } = subscribe;
            const productName = [];
            let totalPrice = 0;
            
            subscribeItems.forEach(item => {
                productName.push(item.product.name);
                totalPrice += item.product.price * item.amount;
            })

            for (const payment of payments) {
                const { paymentDate, paymentComplete, paymentFailure } = payment;
                
                const paymentMoment = moment(paymentDate);
                const paymentMonth = paymentMoment.format("MM");
                const paymentString = paymentMoment.format("YYYY-MM-DD");

                const schedule = {
                    "serviceId": subscribeItems[0].product.serviceId,
                    "serviceName": subscribeItems[0].product.service.name,
                    "productName": productName,
                    "totalPrice": totalPrice,
                    "serviceLogoUrl": subscribeItems[0].product.service.serviceLogoUrl,
                    "status": paymentFailure ? "결제 실패" : paymentComplete ? "결제 완료" : "결제 예정"
                }

                if (paymentMonth === currentMonth || paymentMonth === nextMonth) {
                    response[paymentMonth][paymentString] ? 
                        response[paymentMonth][paymentString].push(schedule)
                        : response[paymentMonth][paymentString] = [schedule]
                }

                // payment는 항상 다음 결제 예정일과 이전 결제일이 남아있음, 따라서 다음 결제일일 경우 항상 payment의 마지막 요소이고
                // 캘린더는 2달치를 나타내기 때문에, 나머지 빈 간격을 매꾸어 줘야함.
                if(!paymentFailure && !paymentComplete) {
                    let estimatedPaymentString = SubpingPayment.calcNextPaymentDate(period, paymentString);
                    let estimatedPaymentMoment = moment(estimatedPaymentString);
                    let estimatedPaymentMonth = estimatedPaymentMoment.format("MM");

                    while(estimatedPaymentMoment <= endMoment) {
                        const schedule = {
                            "serviceId": subscribeItems[0].product.serviceId,
                            "serviceName": subscribeItems[0].product.service.name,
                            "productName": productName,
                            "totalPrice": totalPrice,
                            "serviceLogoUrl": subscribeItems[0].product.service.serviceLogoUrl,
                            "status": "결제 예정"
                        }

                        if (estimatedPaymentMonth === currentMonth || estimatedPaymentMonth === nextMonth) {
                            response[estimatedPaymentMonth][estimatedPaymentString] ? 
                                response[estimatedPaymentMonth][estimatedPaymentString].push(schedule)
                                : response[estimatedPaymentMonth][estimatedPaymentString] = [schedule]
                        }

                        estimatedPaymentString = SubpingPayment.calcNextPaymentDate(period, estimatedPaymentString);
                        estimatedPaymentMoment = moment(estimatedPaymentString);
                        estimatedPaymentMonth = estimatedPaymentMoment.format("MM");
                    } 
                }
            }

            if (reSubscribeDate) {
                const reSubscribeMoment = moment(reSubscribeDate);
                const reSubscribeMonth = reSubscribeMoment.format("MM");
                const reSubscribeString = reSubscribeMoment.format("YYYY-MM-DD");

                const schedule = {
                    "serviceId": subscribeItems[0].product.serviceId,
                    "serviceName": subscribeItems[0].product.service.name,
                    "productName": productName,
                    "serviceLogoUrl": subscribeItems[0].product.service.serviceLogoUrl,
                    "status": "구독 재시작 예정"
                }

                if (reSubscribeMonth === currentMonth || reSubscribeMonth === nextMonth) {
                    response[reSubscribeMonth][reSubscribeString] ? 
                        response[reSubscribeMonth][reSubscribeString].push(schedule)
                        : response[reSubscribeMonth][reSubscribeString] = [schedule]
                }
            }

            if (expiredDate) {
                const expiredMoment = moment(expiredDate);
                const expiredMonth = expiredMoment.format("MM");
                const expiredString = expiredMoment.format("YYYY-MM-DD");

                const schedule = {
                    "serviceId": subscribeItems[0].product.serviceId,
                    "serviceName": subscribeItems[0].product.service.name,
                    "productName": productName,
                    "serviceLogoUrl": subscribeItems[0].product.service.serviceLogoUrl,
                    "status": "구독 해지 예정"
                }

                if (expiredMonth === currentMonth || expiredMonth === nextMonth) {
                    response[expiredMonth][expiredString] ? 
                    response[expiredMonth][expiredString].push(schedule)
                    : response[expiredMonth][expiredString] = [schedule]
                }
            }
        }

        return success({
            success: true,
            message: response
        })

    }

    catch (e) {
        console.log(e)
    }
}