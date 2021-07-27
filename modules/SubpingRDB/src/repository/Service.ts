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
            .getMany()
    }

    async getServicesWithCategory(category: string) {
        const serviceCategoryRepository = this.manager.getCustomRepository(ServiceCategoryRepository);

        const services = await serviceCategoryRepository.createQueryBuilder("serviceCategory")
            .select("service.*")
            .addSelect("tag.tag", "tag")
            .innerJoin("serviceCategory.service", "service")
            .innerJoin("service.serviceTags", "tag")
            .getRawMany()
        
        
    }
}
