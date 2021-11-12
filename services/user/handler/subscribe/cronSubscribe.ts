import SubpingRDB, { Entity, Repository } from "subpingrdb";

import * as moment from "moment-timezone";

import { APIGatewayProxyHandler } from 'aws-lambda';
import { success, failure } from "../../libs/response-lib";
import SubpingPayment from "../../libs/subpingPayment";
import { IncomingWebhook } from "@slack/webhook";

export const handler: APIGatewayProxyHandler = async (event, _context) => {
    try {
        const startTime = new Date().getTime();
        
        const today = moment.tz("Asia/Seoul").format("YYYY-MM-DD");
        const webhook = new IncomingWebhook("https://hooks.slack.com/services/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");
        
        const subpingPayment = new SubpingPayment();
        const subpingRDB = new SubpingRDB();
        const connection = await subpingRDB.getConnection("dev");
        const paymentRepository = connection.getCustomRepository(Repository.Payment);

        const paymentListOfDate = await paymentRepository.queryPaymentListOfDate(today);
        
        const failedPayments = [];
        const abnormalPayments = [];
        
        let totalAmount = 0;
        let successTransaction = 0;
        let failTransaction = 0;
        let abnormalTransaction = 0;
        let paidAmount = 0;
        
        for (const payment of paymentListOfDate) {
            try {
                const result = await subpingPayment.pay(payment);
                totalAmount += result.totalPrice

                if(result.success) {
                    successTransaction += 1;
                    paidAmount += result.totalPrice;
                } 
                
                else {
                    failedPayments.push(payment.id);
                    failTransaction += 1;
                }

            } catch(e) {
                console.log(e);
                abnormalPayments.push(payment.id);
                abnormalTransaction += 1;
            }
        }

        const endTime = new Date().getTime();
        const duration = endTime - startTime;

        await webhook.send(`[구독 갱신 알림 ${today}]\n대상 구독 수 : ${paymentListOfDate.length}\n성공 구독 수 : ${successTransaction}\n실패 구독 수 : ${failTransaction}\n비정상 구독 수 : ${abnormalTransaction}\n\n총 예상 결제액 : ${totalAmount}\n실제 결제액 : ${paidAmount}\n\n실패한 구독 : ${failedPayments}\n비정상 구독 : ${abnormalPayments}\n\n수행시간 : ${duration}ms`)
        
        return success({
            success: true,
            message: "CronSubscribeDone"
        })
    }

    catch (e) {
        console.log(e)
    }
}