import { EntityRepository, Repository } from "typeorm";
import { Alarm } from "../entity/Alarm";

@EntityRepository()
export class AlarmRepository extends Repository<Alarm> {
    async findUserAlarms(email: string) {
        return await this.find({
            user: email
        })
    }

    async findUserUnreadAlarms(email: string) {
        return await this.find({
            user: email,
            read: false
        })
    }

}
