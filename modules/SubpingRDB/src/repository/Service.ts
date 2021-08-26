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
        await this.delete({ name : name });
    }

    async findByName(name: string) {
        return await this.createQueryBuilder("name")
            .where("Service.name = :name", { name })
            .getMany();
    }

    async getServices(options?:{
            category?: boolean,
            tag?: boolean,
            rank?: boolean,
            standardDate?: string,
            standardTime?: string,
            like?: boolean,
            userEmail?: string,
            pagination?: {
                limit: number,
                page: number
            }
        }) {
        
        const { category, tag, rank, standardDate, standardTime, like, userEmail, pagination: { limit, page } } = options;
        
        let query = this.createQueryBuilder("service")

        query = query.select("service.*");

        if(category) {
            query = query
                .addSelect("GROUP_CONCAT(DISTINCT serviceCategory.categoryName)", "category")
                .innerJoin("service.serviceCategories", "serviceCategory");
        }
        
        if(tag) {
            query = query
              .addSelect("GROUP_CONCAT(DISTINCT serviceTag.tag)", "tag")
              .innerJoin("service.serviceTags", "serviceTag")
        }
        
        if(rank) {
            if(standardTime && standardDate) {
                query = query
                .addSelect("serviceRank.rank", "rank")
                .innerJoin("service.serviceRank", "serviceRank", 
                `serviceRank.date = "${standardDate}" 
                AND serviceRank.time = "${standardTime}"`)
                .orderBy("serviceRank.rank");
            }
            
            else {
                throw new Error("[SubpingRDB] getServices Rank가 정의되었지만 기준시간이 없습니다.");
            }
        }

        if(like) {
            if(userEmail) {
                query = query
                    .addSelect("IF(userLike.createdAt IS NULL, False, True)", "like")
                    .leftJoin("service.userLikes", "userLike", `userLike.user = "${userEmail}"`)
            }

            else {
                throw new Error("[SubpingRDB] getServices Like가 정의되었지만 userEmail이 없습니다.")
            }
        }
        
        if(limit && page && standardTime) {
            query = query
                .andWhere(`service.createdAt < "${standardTime}"`)
                .orderBy("service.createdAt", "ASC")
                .offset(limit*(page-1))
                .limit(limit)
        }

        if(category || tag || rank || like) {
            query = query.groupBy("service.id")
        }

        const result = await query
            .getRawMany();

        if(category || tag) {
            result.map(service => {
                if(category) {
                    service.category = service.category.split(",");
                }

                if(tag) {
                    service.tag = service.tag.split(",");
                }
            })
        }
    
        return result;
        
    }

    async getServicesWithCategory(category: string, userEmail: string) {
        const serviceCategoryRepository = this.manager.getCustomRepository(ServiceCategoryRepository);

        const getAllServiceSQL = serviceCategoryRepository.createQueryBuilder("serviceCategory")
            .select("service.*")
            .addSelect("GROUP_CONCAT(DISTINCT serviceCategory.categoryName)", "category")
            .addSelect("GROUP_CONCAT(DISTINCT serviceTag.tag)", "tag")
            .addSelect("IF(userLike.createdAt IS NULL, False, True)", "like")
            .innerJoin("serviceCategory.service", "service")
            .innerJoin("service.serviceTags", "serviceTag", "service.id = serviceTag.serviceId")
            .leftJoin("service.userLikes", "userLike", `userLike.user = "${userEmail}"`)
            .groupBy("service.id")
            .getSql();

        const servicesOfCategory = await this.manager.createQueryBuilder()
            .select("s.*")
            .from("(" + getAllServiceSQL + ")", "s")
            .where(`s.category LIKE "%${category}%"`)
            .getRawMany();

        servicesOfCategory.map(service => {
            service.tag = service.tag.split(",");
            service.category = service.category.split(",");
        });

        return servicesOfCategory;
    }

    async getServiceWithId(id: string, userEmail: string) {
        const service = await this.createQueryBuilder("service")
            .select("service.*")
            .addSelect("GROUP_CONCAT(DISTINCT serviceCategory.categoryName)", "category")
            .where(`service.id = "${id}"`)
            .innerJoin("service.serviceCategories", "serviceCategory")
            .addSelect("GROUP_CONCAT(DISTINCT serviceTag.tag)", "tag")
            .innerJoin("service.serviceTags", "serviceTag")
            .addSelect("IF(userLike.createdAt IS NULL, False, True)", "like")
            .leftJoin("service.userLikes", "userLike", `userLike.user = "${userEmail}"`)
            .addSelect("GROUP_CONCAT(DISTINCT periods.period)", "period")
            .innerJoin("service.periods", "periods")
            .groupBy("service.id")
            .getRawOne();

        service.tag = service.tag.split(",");
        service.category = service.category.split(",");
        service.period = service.period.split(",");

        return service;
    }
}