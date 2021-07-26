import { EntityRepository, Repository } from "typeorm";
import { ServiceCategory } from "../entity/ServiceCategory";

@EntityRepository(ServiceCategory)
export class ServiceCategoryRepository extends Repository<ServiceCategory> {
    findAllServiceCategory(): Promise<ServiceCategory[]> {
        return this.find();
    }

    findOneServiceCategory(serviceId: string): Promise<ServiceCategory> {
        return this.findOne({ service : serviceId });
    }

    async saveServiceCategory(ServiceCategory: ServiceCategory): Promise<void> {
        await this.save(ServiceCategory);
    }

    async deleteServiceCategory(serviceId: string): Promise<void> {
        await this.delete({ service : serviceId });
    }
}
