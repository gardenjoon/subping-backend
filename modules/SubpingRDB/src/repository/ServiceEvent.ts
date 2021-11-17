import { EntityRepository, Repository } from "typeorm";
import { ServiceEvent } from "../entity/ServiceEvent";
import { Service } from "../entity/Service";

@EntityRepository(ServiceEvent)
export class ServiceEventRepository extends Repository<ServiceEvent> {
    // 서비스이벤트 생성
    async createServiceEvent(serviceEventModel: ServiceEvent): Promise<void> {
        await this.save(serviceEventModel);
    }

    // 서비스Id로 서비스이벤트 제거
    async deleteServiceEvent(serviceId: string): Promise<void> {
        const serviceModel = new Service();
        serviceModel.id = serviceId;
        await this.delete({ service : serviceModel });
    }

    // 모든 서비스이벤트 반환
    queryAllServiceEvent(): Promise<ServiceEvent[]> {
        return this.find();
    }

    // 서비스 이름으로 서비스이벤트 반환
    queryServiceEvent(serviceName: string): Promise<ServiceEvent> {
        return this.findOne(serviceName);
    }

    // 기준날짜와 기준시간으로 해당하는 모든 서비스이벤트 반환
    async queryServiceEvents(standardDate: string, standardHour: string) {
        return await this.createQueryBuilder("serviceEvent")
            .select("serviceEvent.*")
            .where(`date = "${standardDate}"`)
            .andWhere(`time = "${standardHour}"`)
            .orderBy("subscribe + view + review")
            .getRawMany();
    } 
}