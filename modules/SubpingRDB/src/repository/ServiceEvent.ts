import { EntityRepository, Repository } from "typeorm";
import { ServiceEvent } from "../entity/ServiceEvent";

@EntityRepository(ServiceEvent)
export class ServiceEventRepository extends Repository<ServiceEvent> {
    findAllServiceEvent(): Promise<ServiceEvent[]> {
        return this.find();
    }

    findOneServiceEvent(name: string): Promise<ServiceEvent> {
        return this.findOne(name);
    }

    async saveServiceEvent(ServiceEvent: ServiceEvent): Promise<void> {
        await this.save(ServiceEvent);
    }

    async deleteServiceEvent(service: string): Promise<void> {
        await this.delete({ service : service });
    }

    async getServiceEvents(standardDate: string, standardHour: Number) {
        return await this.createQueryBuilder("serviceEvent")
            .select("service.id", "service")
            .where(`serviceEvent.date = "${standardDate}"`)
            .andWhere(`serviceEvent.time = "${standardHour}"`)
            .orderBy("subscribe + view + review")
            .getRawMany();
    }
}