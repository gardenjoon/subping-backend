import { EntityRepository, Repository } from "typeorm";
import { ServiceEvent } from "../entity/ServiceEvent";
import * as moment from "moment-timezone";

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

    async getServiceEvents(date: Date, standardHour: Number) {
        const dateString = moment(date).format('YYYY-MM-DD');

        return await this.createQueryBuilder("serviceEvent")
            .select("service.id", "service")
            .addSelect("serviceEvent.*")
            .where("serviceEvent.service = service.id")
            .where(`serviceEvent.date.date = "${dateString}"`)
            .where(`serviceEvent.time = "${standardHour}"`)
            .innerJoin("serviceEvent.service", "service")
            .orderBy("subscribe + view + review")
            .getRawMany();
    }
}