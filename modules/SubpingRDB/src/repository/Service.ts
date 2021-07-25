import {EntityRepository, Repository} from "typeorm";
import { Service } from "../entity/Service";

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

    findByName(name: string) {
        return this.createQueryBuilder("name")
            .where("Service.name = :name", { name })
            .getMany()
    }
}
