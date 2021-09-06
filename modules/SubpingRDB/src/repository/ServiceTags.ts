import { EntityRepository, Repository } from "typeorm";
import { ServiceTag } from "../entity/ServiceTag";

@EntityRepository(ServiceTag)
export class ServiceTagRespository extends Repository<ServiceTag> {
    async getTags() {
        const result = await this.createQueryBuilder("tag")
            .select("DISTINCT tag.tag")
            .getRawMany();

        return result
    }

    async searchTag(requestWord){
        const tags = await this.createQueryBuilder("serviceTag")
        .select("serviceTag.tag, serviceTag.service")
        .where(`tag LIKE "%${requestWord}%"`)
        .getRawMany();
        return tags
    }
}