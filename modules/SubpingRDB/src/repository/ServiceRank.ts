import { EntityRepository, Repository } from "typeorm";
import { ServiceRank } from "../entity/ServiceRank";

@EntityRepository(ServiceRank)
export class ServiceRankRepository extends Repository<ServiceRank> {
    async findAllServiceRank(standardDate: String, standardhour: String) {
        return await this.createQueryBuilder("serviceRank")
            .select("service.*")
            .addSelect("serviceRank.*")
            .where(`serviceRank.service = service.id`)
            .where(`serviceRank.date = "${standardDate}"`)
            .where(`serviceRank.time = "${standardhour}"`)
            .innerJoin("serviceRank.service", "service")
            .orderBy("rank")
            .getRawMany();
    }

    findOneServiceRank(name: string): Promise<ServiceRank> {
        return this.findOne(name);
    }

    async saveServiceRank(ServiceRank: ServiceRank): Promise<void> {
        await this.save(ServiceRank);
    }

    async deleteServiceRank(service: string): Promise<void> {
        await this.delete({ service : service });
    }
}