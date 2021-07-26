import {EntityRepository, Repository} from "typeorm";
import { ServiceEvent } from "../entity/ServiceEvent";

@EntityRepository(ServiceEvent)
export class ServiceEventRepository extends Repository<ServiceEvent> {
   
}