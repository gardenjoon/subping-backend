import { EntityRepository, Repository } from "typeorm";
import { Payment } from "../entity/Payment";

@EntityRepository(Payment)
export class PaymentRepository extends Repository<Payment> {
    async queryPaymentListOfDate(targetDate: string) {
        return await this.createQueryBuilder("payment")
            .where("payment.paymentComplete = False and payment.paymentFailure = False")
            .andWhere(`payment.paymentDate = "${targetDate}"`)
            .getMany()
    }

    async queryPayment(payment: Payment) {
        return await this.createQueryBuilder("payment") 
            .innerJoinAndSelect("payment.subscribe", "subscribe")
            .innerJoinAndSelect("subscribe.userCard", "userCard")
            .innerJoinAndSelect("subscribe.subscribeItems", "subscribeItems")
            .innerJoinAndSelect("subscribeItems.product", "product")
            .where(`payment.id = "${payment.id}"`)
            .getOne()
    }

    async queryLastPaidPayment(subscribeId: string, userId: string) {
        return await this.createQueryBuilder("payment")
            .where(`payment.subscribe = "${subscribeId}" AND `)
            .orderBy('payment.paymentDate', "DESC")
            .getOne()
    }
}