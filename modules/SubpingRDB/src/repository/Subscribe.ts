import { EntityRepository, Repository } from "typeorm";
import { Subscribe } from "../entity/Subscribe";

@EntityRepository(Subscribe)
export class SubscribeRepository extends Repository<Subscribe> {
    findAllSubscribe(): Promise<Subscribe[]> {
        return this.find();
    }

    findOneSubscribe(userEmail: string): Promise<Subscribe> {
        return this.findOne({ user : userEmail });
    }

    async updateSubscribe(id: string, date: string): Promise<void> {
        await this.update(id, { expiredDate : date })
    }

    async saveSubscribe(Subscribe: Subscribe): Promise<void> {
        await this.save(Subscribe);
    }

    async deleteSubscribe(userEmail: string): Promise<void> {
        await this.delete({ user : userEmail });
    }

    async getSubscribes(userEmail: string) {
        return await this.createQueryBuilder("subscribe")
            .select("user.email", "user")
            .addSelect("product.*")
            .addSelect("subscribe.*")
            .where(`subscribe.user = "${userEmail}"`)
            .innerJoin("subscribe.user", "user")
            .innerJoin("subscribe.product", "product")
            .getRawMany()
    }

    async getOneSubscribe(userEmail: string, productId: string) {
        return await this.createQueryBuilder("subscribe")
            .select("user.email", "user")
            .addSelect("product.*")
            .addSelect("subscribe.*")
            .where(`subscribe.user = "${userEmail}"`)
            .where(`subscribe.product = "${productId}"`)
            .innerJoin("subscribe.user", "user")
            .innerJoin("subscribe.product", "product")
            .getRawMany()
    }
}