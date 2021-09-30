import { EntityRepository, Repository } from "typeorm";
import { Subscribe } from "../entity/Subscribe";

@EntityRepository(Subscribe)
export class SubscribeRepository extends Repository<Subscribe> {
    findAllSubscribe(): Promise<Subscribe[]> {
        return this.find();
    }

    async updateSubscribe(subscribeId: string, date: Date): Promise<void> {
        await this.update(subscribeId, { expiredDate : date });
    }

    async saveSubscribe(Subscribe: Subscribe): Promise<void> {
        await this.save(Subscribe);
    }


    async getSubscribes(userId: string) {
        return await this.createQueryBuilder("subscribe")
            .select(["subscribe", "subscribe.user", "subscribeItems.amount", "product"])
            .where(`subscribe.user = "${userId}"`)
            .innerJoin("subscribe.user", "user")
            .innerJoin("subscribe.subscribeItems", "subscribeItems")
            .innerJoin("subscribeItems.product", "product")
            .getMany();
    }

    async getSubscribesByServiceId(userId: string, serviceId: string) {
        return await this.createQueryBuilder("subscribe")
            .select("subscribe.*")
            .where(`subscribe.user = "${userId}"`)
            .innerJoin("subscribe.subscribeItems", "subscribeItems")
            .innerJoin("subscribeItems.product", "product", `product.serviceId = "${serviceId}"`)
            .getRawMany();
    }

    async getOneSubscribe(userId: string, productId: string) {
        return await this.createQueryBuilder("subscribe")
            .select("user.id", "user")
            .addSelect("product.*")
            .addSelect("subscribe.*")
            .where(`subscribe.user = "${userId}"`)
            .where(`subscribe.product = "${productId}"`)
            .innerJoin("subscribe.user", "user")
            .innerJoin("subscribe.product", "product")
            .getRawMany();
    }
}