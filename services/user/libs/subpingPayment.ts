import Iamport from "iamport";
import * as moment from "moment-timezone";
import SubpingRDB, { Entity, Repository } from "subpingrdb";
import { Payment } from "subpingrdb/dist/src/entity/Payment";

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
        try {
            const today = moment.tz("Asia/Seoul").format("YYYY-MM-DD");
            let totalPrice = 0;
    
            const subpingRDB = new SubpingRDB();
            const connection = await subpingRDB.getConnection("dev");
            const paymentRepository = connection.getCustomRepository(Repository.Payment);
            const queryRunner = connection.createQueryRunner();
    
            const targetPayment = await paymentRepository.queryPayment(payment);

            const subscribe = targetPayment.subscribe;
            const subscribeItems = subscribe.subscribeItems;
    
            subscribeItems.map(item => {
                totalPrice += (item.amount * item.product.price);
            })
    
            try {
                const paymentResult = await this.iamport.subscribe.again({
                    name: "섭핑 정기결제",
                    customer_uid: subscribe.userCard.billingKey,
                    merchant_uid: targetPayment.id,
                    amount: totalPrice
                });
    
                const { imp_uid, status } = paymentResult;
    
                if (status === "paid") {
                    await queryRunner.startTransaction();
    
                    try {
                        await queryRunner.manager.update(Entity.Payment, { id: targetPayment.id }, { paymentComplete: true, amount: totalPrice, iamportUid: imp_uid });
                        const nextPaymentDate = SubpingPayment.calcNextPaymentDate(subscribe.period, today);
    
                        const nextPayment = new Entity.Payment;
                        nextPayment.amount = 0;
                        nextPayment.paymentDate = new Date(nextPaymentDate);
                        nextPayment.paymentComplete = false;
                        nextPayment.rewardComplete = false;
                        nextPayment.subscribe = targetPayment.subscribe;
    
                        await queryRunner.manager.save(nextPayment);
                        await queryRunner.commitTransaction();

                        //로그 코드 정렬 금지
                        console.log(
`[SubpingPayment] 결제 성공
price: ${totalPrice}
nextPaymentDate: ${nextPaymentDate}
userCard: ${subscribe.userCard.id}
subscribeId: ${subscribe.id}
paymentId: ${targetPayment.id}
imp_uid: ${imp_uid}
status: ${status}`);
                    } catch (e) {
                        console.log(`[SubpingPayment] DB Error: ${e.message}`)
                        await queryRunner.rollbackTransaction()
                        throw new Error("SubpingPaymentPayError");
                    } finally {
                        await queryRunner.release();
                    }
                }
            }
            catch (e) {
                //로그 코드 정렬 금지
                console.log(
`[SubpingPayment] 결제 실패
price: ${totalPrice}
userCard: ${subscribe.userCard.id}
subscribeId: ${subscribe.id}
paymentId: ${targetPayment.id}
error: ${e.message}`);

                throw new Error("SubpingPaymentPayError");
            }
        }
        catch(e) {
            //로그 코드 정렬 금지
            console.log(
`[SubpingPayment] 결제 실패
paymentId: ${payment.id}
error: ${e.message}`);
            throw new Error("SubpingPaymentPayError");

        }
        
    }
}

export default SubpingPayment;