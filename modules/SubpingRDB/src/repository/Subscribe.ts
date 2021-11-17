import { EntityRepository, Repository } from "typeorm";
import { Subscribe } from "../entity/Subscribe";

@EntityRepository(Subscribe)
export class SubscribeRepository extends Repository<Subscribe> {
    // 구독 생성
    async createSubscribe(subscribeModel: Subscribe): Promise<void> {
        await this.save(subscribeModel);
    }

    async updateSubscribe(subscribeId: string, date: Date): Promise<void> {
        await this.update(subscribeId, { expiredDate: date });
    }

    // 해당 구독의 만료일자 업데이트
    async updateExpiredDate(subscribeId: string, date: Date): Promise<void> {
        await this.update(subscribeId, { expiredDate: date });
    }

    // 해당 유저의 모든 구독 반환
    async querySubscribes(userId: string, options?: {
        subscribeId?: string
        payment?: {
            startDate: Date;
            endDate: Date;
        },
        service?: boolean;
    }) {
        let query = this.createQueryBuilder("subscribe")
            .select([
                "subscribe", 
                "subscribe.user",
                "subscribeItems.amount",
                "subscribeItems.reserved",
                "product"])
            .where(`subscribe.user = "${userId}"`)
            .innerJoin("subscribe.user", "user")
            .innerJoin("subscribe.subscribeItems", "subscribeItems")
            .innerJoin("subscribeItems.product", "product")

        if (options) {
            if (options.payment) {
                query = query.addSelect([
                    "payment.id", 
                    "payment.amount", 
                    "payment.paymentDate", 
                    "payment.paymentComplete", 
                    "payment.paymentFailure", 
                    "payment.failureReason", 
                    "payment.paidCardVendor",
                    "payment.paidCardNumber",
                    "payment.createdAt", 
                    "payment.updatedAt"
                ])

                if (options.payment.endDate && options.payment.startDate) {
                    query = query.innerJoin('subscribe.payments', "payment",
                        `payment.paymentDate <= "${options.payment.endDate.toISOString()}"
                    AND payment.paymentDate >= "${options.payment.startDate.toISOString()}"`);
                } else {
                    query = query.innerJoin('subscribe.payments', "payment");
                }

                query = query.leftJoinAndSelect('payment.reward', 'reward');
                query = query.orderBy('payment.paymentDate', 'DESC')
            }

            if (options.service) {
                query = query.innerJoinAndSelect("product.service", "service");
            }

            if (options.subscribeId) {
                query = query.andWhere(`subscribe.id = "${options.subscribeId}"`)
            }
        }

        return await query.getMany()
    }

    // 해당 서비스에 대한 구독만 반환
    async querySubscribesByServiceId(userId: string, serviceId: string) {
        return await this.createQueryBuilder("subscribe")
            .select([
                "subscribe", 
                "subscribe.user",
                "subscribeItems.amount", 
                "subscribeItems.reserved",
                "product", 
                "payment.id", 
                "payment.amount", 
                "payment.paymentDate", 
                "payment.paymentComplete", 
                "payment.paymentFailure", 
                "payment.failureReason", 
                "payment.paidCardVendor",
                "payment.paidCardNumber",
                "payment.createdAt", 
                "payment.updatedAt"])
            .where(`subscribe.user = "${userId}"`)
            .innerJoin("subscribe.user", "user")
            .innerJoin("subscribe.subscribeItems", "subscribeItems")
            .innerJoin("subscribeItems.product", "product", `product.serviceId = "${serviceId}"`)
            .innerJoin('subscribe.payments', "payment")
            .getOne();
    }
}