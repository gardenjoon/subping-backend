import { EntityRepository, Repository } from "typeorm";
import { Subscribe } from "../entity/Subscribe";

@EntityRepository(Subscribe)
export class SubscribeRepository extends Repository<Subscribe> {
    // 구독 생성
    async createSubscribe(subscribeModel: Subscribe): Promise<void> {
        await this.save(subscribeModel);
    }

    // 해당 유저의 구독 제거
    async deleteSubscribe(userId: string): Promise<void> {
        await this.delete({ user : userId });
    }

    // 모든 구독 반환
    queryAllSubscribes(): Promise<Subscribe[]> {
        return this.find();
    }

    // 해당 유저의 구독 반환
    querySubscribe(userId: string): Promise<Subscribe> {
        return this.findOne({ user : userId });
    }

    // 해당 구독의 만료일자 업데이트
    async updateExpiredDate(subscribeId: string, date: Date): Promise<void> {
        await this.update(subscribeId, { expiredDate : date });
    }

    // 해당 유저의 모든 구독 반환
    async querySubscribes(userId: string) {
        return await this.createQueryBuilder("subscribe")
            .select("user.id", "user")
            .addSelect("product.*")
            .addSelect("subscribe.*")
            .where(`subscribe.user = "${userId}"`)
            .innerJoin("subscribe.user", "user")
            .innerJoin("subscribe.subscribeItem", "product")
            .getRawMany();
    }

    // 해당 서비스의 모든 구독 반환
    async querySubscribesByServiceId(userId: string, serviceId: string) {
        return await this.createQueryBuilder("subscribe")
            .select("subscribe.*")
            .where(`subscribe.user = "${userId}"`)
            .innerJoin("subscribe.subscribeItems", "subscribeItems")
            .innerJoin("subscribeItems.product", "product", `product.serviceId = "${serviceId}"`)
            .getRawMany();
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