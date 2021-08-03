import { EntityRepository, Repository } from "typeorm";
import { ServiceTag } from "../entity/ServiceTag";

@EntityRepository(ServiceTag)
export class ServiceTagRespository extends Repository<ServiceTag> {
   async getTags() {
        const result = await this.createQueryBuilder("tag")
            .select("DISTINCT tag.tag")
            .getRawMany()

        return result
    }
}
