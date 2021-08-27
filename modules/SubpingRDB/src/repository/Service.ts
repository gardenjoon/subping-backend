import { EntityRepository, Repository } from "typeorm";
import { Service } from "../entity/Service";
import { ServiceCategoryRepository } from "./ServiceCategory";

@EntityRepository(Service)
export class ServiceRepository extends Repository<Service> {
    findAllService(): Promise<Service[]> {
        return this.find();
    }

    findOneService(name: string): Promise<Service> {
        return this.findOne(name);
    }

    async saveService(Service: Service): Promise<void> {
        await this.save(Service);
    }

    async deleteService(name: string): Promise<void> {
        await this.delete({ name: name });
    }

    async findByName(name: string) {
        return await this.createQueryBuilder("name")
            .where("Service.name = :name", { name })
            .getMany();
    }

    async getServices(options?: {
        category?: boolean,
        tag?: boolean,
        period?: boolean,
        rank?: {
            standardDate: string,
            standardTime: string,
        },
        like?: {
            userEmail: string,
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
                    .innerJoin("service.serviceRank", "serviceRank",
                        `serviceRank.date = "${rank.standardDate}" 
                AND serviceRank.time = "${rank.standardTime}"`)
                    .orderBy("serviceRank.rank");
            }

            else {
                throw new Error("[SubpingRDB] getServices Rank가 정의되었지만 기준시간이 없습니다.");
            }
        }

        if (like) {
            if (like.userEmail) {
                query = query
                    .addSelect("IF(userLike.createdAt IS NULL, False, True)", "like")
                    .leftJoin("service.userLikes", "userLike", `userLike.user = "${like.userEmail}"`)
            }

            else {
                throw new Error("[SubpingRDB] getServices Like가 정의되었지만 userEmail이 없습니다.")
            }
        }

        if (pagination) {
            if (pagination.limit && pagination.page && pagination.standardTime) {
                query = query
                    .andWhere(`service.createdAt < "${pagination.standardTime}"`)
                    .orderBy("service.createdAt", "ASC")
                    .offset(pagination.limit * (pagination.page - 1))
                    .limit(pagination.limit)
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
}