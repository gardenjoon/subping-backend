import { EntityRepository, Repository } from "typeorm";
import { ServiceRank } from "../entity/ServiceRank";
import * as moment from "moment-timezone";

@EntityRepository(ServiceRank)
export class ServiceRankRepository extends Repository<ServiceRank> {
    async findAllServiceRank(standardDate: Date, standardhour: String) {
        const dateString = moment(standardDate).format("YYYY-MM-DD");

        return await this.createQueryBuilder("serviceRank")
            .select("service.*")
            .addSelect("serviceRank.*")
            .where(`serviceRank.service = service.id`)
            .where(`serviceRank.date = "${dateString}"`)
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