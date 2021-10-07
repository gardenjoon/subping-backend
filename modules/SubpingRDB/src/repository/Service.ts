import { EntityRepository, Repository } from "typeorm";
import { Service } from "../entity/Service";

@EntityRepository(Service)
export class ServiceRepository extends Repository<Service> {
    // 서비스 생성
    async createService(serviceModel: Service): Promise<void> {
        await this.save(serviceModel);
    }

    // 이름으로 해당 서비스 삭제
    async deleteService(serviceName: string): Promise<void> {
        await this.delete({ name: serviceName });
    }

    // 모든 서비스 반환
    queryAllServices(): Promise<Service[]> {
        return this.find();
    }

    // 해당 이름의 서비스 반환
    queryService(serviceName: string): Promise<Service> {
        return this.findOne(serviceName);
    }

    /*
        옵션에 해당하는 모든 서비스 반환
        필요 인자
            rank : 기준날짜, 기준시간
            like : 유저 Id
            pagination : 갯수, 페이지번호, 기준시간
            filter : 카테고리 이름 or 서비스 Id
        카테고리, 태그, 주기는 리스트 형식으로 반환
    */
    async queryServices(options?: {
        category?: boolean,
        tag?: boolean,
        period?: boolean,
        rank?: {
            standardDate: string,
            standardTime: string,
        },
        like?: {
            userId: string,
        },
        pagination?: {
            limit: number,
            page: number,
            standardTime: string
        }
        filter?: {
            categoryName?: string,
            serviceId?: string,
        }
    }) {
        const { category, tag, period, rank, like, pagination, filter } = options;

        let query = this.createQueryBuilder("service")

        query = query.select("service.*");

        if (category) {
            if (filter && filter.categoryName) {
                query = query
                    .addSelect("GROUP_CONCAT(DISTINCT serviceCategory.categoryName)", "category")
                    .innerJoin("service.serviceCategories", "serviceCategory", `serviceCategory.categoryName LIKE "%${filter.categoryName}%"`);

            } else {
                query = query
                    .addSelect("GROUP_CONCAT(DISTINCT serviceCategory.categoryName)", "category")
                    .innerJoin("service.serviceCategories", "serviceCategory");
            }
        }

        if (tag) {
            query = query
                .addSelect("GROUP_CONCAT(DISTINCT serviceTag.tag)", "tag")
                .innerJoin("service.serviceTags", "serviceTag")
        }

        if (period) {
            query = query
                .addSelect("GROUP_CONCAT(DISTINCT periods.period)", "period")
                .innerJoin("service.periods", "periods")
        }

        if (rank) {
            if (rank.standardTime && rank.standardDate) {
                query = query
                    .addSelect("serviceRank.rank", "rank")
                    .innerJoin("service.serviceRanks", "serviceRank",
                        `serviceRank.date = "${rank.standardDate}" 
                AND serviceRank.time = "${rank.standardTime}"`)
                    .orderBy("serviceRank.rank");
            }

            else {
                throw new Error("[SubpingRDB] getServices Rank가 정의되었지만 기준시간이 없습니다.");
            }
        }

        if (like) {
            if (like.userId) {
                query = query
                    .addSelect("IF(userLike.createdAt IS NULL, False, True)", "like")
                    .leftJoin("service.userLikes", "userLike", `userLike.user = "${like.userId}"`)
            }

            else {
                throw new Error("[SubpingRDB] getServices Like가 정의되었지만 userId가 없습니다.")
            }
        }

        if (pagination) {
            if (pagination.limit && pagination.page && pagination.standardTime) {
                query = query
                    .andWhere(`service.createdAt < "${pagination.standardTime}"`)
                    .offset(pagination.limit * (pagination.page - 1))
                    .limit(pagination.limit)
            }
            if (!rank) {
                    query = query.orderBy("service.createdAt", "ASC")
            }
        }

        if (filter) {
            if (filter.serviceId) {
                query = query.where(`service.id = "${filter.serviceId}"`)
            }
        }

        if (category || tag || rank || like || period) {
            query = query.groupBy("service.id")
        }

        const result = await query
            .getRawMany();

        if (category || tag || period) {
            result.map(service => {
                if (category) {
                    service.category = service.category.split(",");
                }

                if (tag) {
                    service.tag = service.tag.split(",");
                }

                if (period) {
                    service.period = service.period.split(",");
                }
            })
        }

        return result;
    }

    // 검색어와 이름, 설명이 일치하는 모든 서비스 반환
    async searchServices(option: {
        requestWord: string, 
        autoComplete: boolean, 
        pagination?: {
            take: number,
            skip: number,
            standardTime: string
        }
    }) {
        const { requestWord, autoComplete, pagination } = option;

        let query = this.createQueryBuilder("service")
            .where(`name LIKE "%${requestWord}%"`)
            .orWhere(`summary LIKE "%${requestWord}%"`)
            .andWhere(`service.createdAt < "${pagination.standardTime}"`)
            .skip(pagination.take * (pagination.skip - 1))
            .take(pagination.take)

        if (autoComplete) {
            query = query.select("service.name, service.id, service.serviceLogoUrl")
        }

        else {
            query = query
                .select("service.*")
                .addSelect("GROUP_CONCAT(DISTINCT serviceTag.tag)", "tag")
                .innerJoin("service.serviceTags", "serviceTag")
                .groupBy("service.id")
        }

        const services = await query.getRawMany();

        services.map(service => {
            if (service.tag) {
                service.tag = service.tag.split(",");
            }
        });

        return services
    }
}