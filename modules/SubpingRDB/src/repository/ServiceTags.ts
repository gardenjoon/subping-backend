import { EntityRepository, Repository } from "typeorm";
import { ServiceTag } from "../entity/ServiceTag";

@EntityRepository(ServiceTag)
export class ServiceTagRepository extends Repository<ServiceTag> {
    // 검색어와 태그명이 일치하는 모든 태그 반환
    async searchTags(option: {
        requestWord: string,
        pagination?: {
        take: number,
        skip: number,
        standardTime: string
        }
    }) {
        const { requestWord, pagination } = option;

        return await this.createQueryBuilder("serviceTag")
        .select("DISTINCT serviceTag.tag", "tag")
        .innerJoin("serviceTag.service", "service")
        .where(`tag LIKE "%${requestWord}%"`)
        .orWhere(`service.name LIKE "%${requestWord}%"`)
        .andWhere(`serviceTag.createdAt < "${pagination.standardTime}"`)
        .skip(pagination.take * (pagination.skip - 1))
        .take(pagination.take)
        .getRawMany();
    }
}