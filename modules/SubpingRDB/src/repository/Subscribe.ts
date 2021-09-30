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
    async querySubscribes(userId: string) {
        return await this.createQueryBuilder("subscribe")
            .select(["subscribe", "subscribe.user", "subscribeItems.amount", "product"])
            .where(`subscribe.user = "${userId}"`)
            .innerJoin("subscribe.user", "user")
            .innerJoin("subscribe.subscribeItems", "subscribeItems")
            .innerJoin("subscribeItems.product", "product")
            .getMany();
    }

    // 해당 서비스에 대한 구독만 반환
    async querySubscribesByServiceId(userId: string, serviceId: string) {
        return await this.createQueryBuilder("subscribe")
            .select(["subscribe", "subscribe.user", "subscribeItems.amount", "product"])
            .where(`subscribe.user = "${userId}"`)
            .innerJoin("subscribe.user", "user")
            .innerJoin("subscribe.subscribeItems", "subscribeItems")
            .innerJoin("subscribeItems.product", "product", `product.serviceId = "${serviceId}"`)
            .getOne();
    }

    // 해당 상품의 모든 구독 반환 (구버전)
    async querySubscribeByProductId(userId: string, productId: string) {
        return await this.createQueryBuilder("subscribe")
            .select("user.id", "user")
            .addSelect("product.*")
            .addSelect("subscribe.*")
            .where(`subscribe.user = "${userId}"`)
            .andWhere(`subscribe.product = "${productId}"`)
            .innerJoin("subscribe.user", "user")
            .innerJoin("subscribe.product", "product")
            .getRawMany();
    }
}