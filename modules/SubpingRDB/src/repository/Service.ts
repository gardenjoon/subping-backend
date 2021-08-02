import { EntityRepository, Repository } from "typeorm";
import { Service } from "../entity/Service";
import { ServiceCategory } from "../entity/ServiceCategory";
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
            .getMany()
    }

    async getServicesWithCategory(category: string) {
        const serviceCategoryRepository = this.manager.getCustomRepository(ServiceCategoryRepository);

        const getAllServiceSQL = serviceCategoryRepository.createQueryBuilder("serviceCategory")
            .select("service.*")
            .addSelect("GROUP_CONCAT(DISTINCT serviceCategory.categoryName)", "category")
            .addSelect("GROUP_CONCAT(DISTINCT serviceTag.tag)", "tag")
            .innerJoin("serviceCategory.service", "service")
            .innerJoin("service.serviceTags", "serviceTag", "service.id = serviceTag.serviceId")
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
        })
        
        return servicesOfCategory;
    }
    async getServicesWithRank(){
        return await this.createQueryBuilder("service")
            .select("serviceRank.*")
            .addSelect("service.*")
            .where("service.id = serviceRank.service")
            .innerJoin("service.serviceRank", "serviceRank")
            .getRawMany()
    }
}
