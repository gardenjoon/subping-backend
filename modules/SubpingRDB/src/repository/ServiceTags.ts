import { EntityRepository, Repository } from "typeorm";
import { ServiceTag } from "../entity/ServiceTag";

@EntityRepository(ServiceTag)
export class ServiceTagRepository extends Repository<ServiceTag> {
    // 검색어와 태그명이 일치하는 모든 태그 반환
    async searchTags(requestWord: string){
        return await this.createQueryBuilder("serviceTag")
        .select("serviceTag.tag, serviceTag.service")
        .where(`tag LIKE "%${requestWord}%"`)
        .getRawMany();
    }
}