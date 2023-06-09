import { IncomingWebhook } from "@slack/webhook";
import Iamport from "iamport";
import * as moment from "moment-timezone";
import SubpingRDB, { Entity, Repository } from "subpingrdb";
import { Payment } from "subpingrdb/dist/src/entity/Payment";
import { SubscribeItem } from "subpingrdb/dist/src/entity/SubscribeItem";

type Response = {
    success: boolean;
    totalPrice: number;
    error: string;
}

class SubpingPayment {
    iamport = Iamport({
        impKey: "5350926902723477",
        impSecret: "EtuTdCQJ0lKWBlTHzFWW7IH5M1inQWcvpGoDiemjA7fcs9U2OQYVyG1lHjJyfW4FCsiVHFeiMtvfDphr"
    });

    static calcNextPaymentDate(period: string, paymentDate: string) {
        const currentDate = moment(paymentDate);
        let nextDate: moment.Moment;

        switch (period) {
            case "1M":
                nextDate = currentDate.add(1, "month");
                break;

            case "2M":
                nextDate = currentDate.add(2, "month");
                break;

            case "3M":
                nextDate = currentDate.add(3, "month");
                break;

            case "1W":
                nextDate = currentDate.add(1, "week");
                break;

            case "2W":
                nextDate = currentDate.add(2, "week");
                break;

            case "3W":
                nextDate = currentDate.add(3, "week");
                break;

            default:
                throw Error(`[Payment calcNextPaymentDate] 주기가 잘못 입력되었습니다. 입력 값 : "${period}`)
        }

        return nextDate.format("YYYY-MM-DD");
    }

    async pay(payment: Payment) {
        const webhook = new IncomingWebhook("https://hooks.slack.com/services/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");

        const response: Response = {
            success: false,
            totalPrice: 0,
            error: ""
        };

        try {
            const today = moment.tz("Asia/Seoul").format("YYYY-MM-DD");
            let totalPrice = 0;
            let reservedTotalPrice = 0;

            const subpingRDB = new SubpingRDB();
            const connection = await subpingRDB.getConnection("dev");
            const subscribeRepository = connection.getCustomRepository(Repository.Subscribe);
            const paymentRepository = connection.getCustomRepository(Repository.Payment);

            const queryRunner = connection.createQueryRunner();
            const targetPayment = await paymentRepository.queryPayment(payment);
            const subscribe = targetPayment.subscribe;

            if(subscribe.expiredDate != null) {
                const expireDateString = moment(subscribe.expiredDate).format("YYYY-MM-DD");

                if(expireDateString == today) {
                    await subscribeRepository.delete({
                        id: subscribe.id
                    });

                    response.success = true;
                    response.totalPrice = 0;
                    
                    return response;
                } 
                
                else {
                    response.success = false;
                    response.totalPrice = 0;
                    response.error = "잘못된 해지일";
                    
                    return response;
                }
            }
            
            if(subscribe.reSubscribeDate != null) {
                const reSubscribeDateString = moment(subscribe.reSubscribeDate).format("YYYY-MM-DD");

                if(reSubscribeDateString == today) {
                    await subscribeRepository.update({
                        id: subscribe.id
                    }, {
                        reSubscribeDate: null
                    })
                } 
                
                else {
                    await paymentRepository.update({
                        id: targetPayment.id
                    }, {
                        paymentDate: reSubscribeDateString
                    })
                    
                    response.success = false;
                    response.totalPrice = 0;
                    response.error = "잘못된 일시정지 해제일";
                    
                    return response;
                }
            }

            const subscribeItems = subscribe.subscribeItems;
            const reservedItems: SubscribeItem[] = [];

            subscribeItems.map(item => {
                if(item.reserved) {
                    reservedItems.push(item);
                    reservedTotalPrice += (item.amount * item.product.price);
                } else {
                    totalPrice += (item.amount * item.product.price);
                }
            })
            
            if(reservedItems.length != 0) {
                totalPrice = reservedTotalPrice;
                
                const queryRunner = connection.createQueryRunner();

                try {
                    await queryRunner.startTransaction();

                    await queryRunner.manager.delete(Entity.SubscribeItem, {
                        reserved: false
                    });
                    
                    await queryRunner.manager.update(Entity.SubscribeItem, {
                        subscribe: subscribe.id,
                    }, {
                        reserved: false
                    });

                    await queryRunner.commitTransaction();
                } catch(e) {
                    console.log(
                        `[SubpingPayment] 예약 결제 실패\n구독 id : "${subscribe.id}"`);
                    
                    await webhook.send({
                        text:
                            `[결제 실패 알림]\n사유 : 예약된 구독 에러\n에러 : ${e}`
                    }).catch(_ => { });

                    await queryRunner.rollbackTransaction();
                    await queryRunner.release()

                    response.success = false;
                    response.error = e;
                    response.totalPrice = totalPrice;

                    return response
                } finally { 
                    await queryRunner.release()
                }
            } 

            response.totalPrice = totalPrice;

            try {
                const paymentResult = await this.iamport.subscribe.again({
                    name: "섭핑 정기결제",
                    customer_uid: subscribe.userCard.billingKey,
                    merchant_uid: targetPayment.id,
                    amount: totalPrice
                });

                const { imp_uid, status, fail_reason, receipt_url, card_number, card_name } = paymentResult;

                if (status === "paid") {
                    await queryRunner.startTransaction();

                    try {
                        await queryRunner.manager.update(Entity.Payment, { id: targetPayment.id }, {
                            paymentComplete: true,
                            amount: totalPrice,
                            iamportUid: imp_uid,
                            paidCardNumber: card_number,
                            paidCardVendor: card_name
                        });
                        const nextPaymentDate = SubpingPayment.calcNextPaymentDate(subscribe.period, today);

                        const nextPayment = new Entity.Payment();
                        nextPayment.amount = 0;
                        nextPayment.paymentDate = new Date(nextPaymentDate);
                        nextPayment.paymentComplete = false;
                        nextPayment.subscribe = targetPayment.subscribe;

                        await queryRunner.manager.save(nextPayment);

                        const reward = new Entity.Reward();
                        reward.payment = targetPayment,
                        reward.startDate = today,
                        reward.endDate = moment(SubpingPayment.calcNextPaymentDate(subscribe.period, today)).subtract(1, "day").format("YYYY-MM-DD");
                            
                        await queryRunner.manager.save(reward);

                        for(const items of subscribe.subscribeItems) {
                            const rewardItem = new Entity.RewardItem();
                            rewardItem.product = items.product;
                            rewardItem.amount = items.amount;
                            rewardItem.reward = reward;
                            
                            await queryRunner.manager.save(rewardItem);
                        }
                        
                        await queryRunner.commitTransaction();

                        console.log(
                            `[SubpingPayment] 결제 성공\nprice: ${totalPrice}\nnextPaymentDate: ${nextPaymentDate}\nuserCard: ${subscribe.userCard.id}\nsubscribeId: ${subscribe.id}\npaymentId: ${targetPayment.id}\nimp_uid: ${imp_uid}\nstatus: ${status}`);

                        response.success = true;

                        return response;
                    }
                    
                    catch (e) {
                        console.log(`[SubpingPayment] DB Error: ${e.message}`)
                        await queryRunner.rollbackTransaction()

                        await webhook.send({
                            text:
                                `[결제 실패 알림]\n사유 : DB 에러\n에러 : ${e}`
                        }).catch(_ => { });

                        console.log(`[SubpingPayment] 결제취소 요청`)
                        const cancelResult = await this.iamport.payment.cancel({
                            imp_uid: imp_uid,
                            checksum: totalPrice
                        });
                        console.log(`[SubpingPayment] 결제취소 결과 : ${cancelResult}`)

                        response.success = false;
                        response.error = e;
                    } 
                    
                    finally {
                        await queryRunner.release();
                        return response;
                    }
                }
                
                else if (status == "failed") {
                    await paymentRepository.update({
                        id: payment.id,
                    }, {
                        failureReason: fail_reason,
                        paymentFailure: true,
                        paidCardNumber: null,
                        paidCardVendor: targetPayment.subscribe.userCard.cardVendor
                    });
                    console.log(
                        `[SubpingPayment] 결제 실패\nprice: ${totalPrice}\nuserCard: ${subscribe.userCard.id}\nsubscribeId: ${subscribe.id}\npaymentId: ${targetPayment.id}\nerror: ${fail_reason}`);

                    await webhook.send({
                        text:
                            `[결제 실패 알림]\n사유 : 사용자 카드 결제상태 에러\n에러 : ${fail_reason}`
                    }).catch(_ => { });

                    response.success = false;
                    response.error = fail_reason;
                    return response;
                }
            }
            catch (e) {
                console.log(
                    `[SubpingPayment] 결제 실패\nprice: ${totalPrice}\nuserCard: ${subscribe.userCard.id}\nsubscribeId: ${subscribe.id}\npaymentId: ${targetPayment.id}\nerror: ${e.message}`);

                await webhook.send({
                    text:
                        `[결제 실패 알림]\n사유 : 아임포트 에러\n에러 : ${e}`
                }).catch(_ => { });

                await paymentRepository.update({
                    id: payment.id
                }, {
                    failureReason: e.message,
                    paymentFailure: true,
                    paidCardVendor: subscribe.userCard.cardVendor,
                    paidCardNumber: null,
                });

                response.success = false;
                response.error = "아임포트 에러";
                return response;
            }
        }
        catch (e) {
            console.log(
                `[SubpingPayment] 결제 실패\npaymentId: ${payment.id}\nerror: ${e.message}`);

            await webhook.send({
                text:
                    `[결제 실패 알림]\n사유 : 로직 에러\n에러 : ${e}`
            }).catch(_ => { });

            response.success = false;
            response.error = e;
            return response;
        }
    }
}

export default SubpingPayment;