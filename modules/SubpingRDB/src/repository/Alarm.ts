import { EntityRepository, Repository } from "typeorm";
import { Alarm } from "../entity/Alarm";

@EntityRepository(Alarm)
export class AlarmRepository extends Repository<Alarm> {
    async saveAlarm(Alarm: Alarm): Promise<void> {
        await this.save(Alarm);
    }

    async updateAlarmRead(id: string, read: boolean): Promise<void> {
        await this.update(id, { read: read })
    }

    async deleteAlarm(user: string): Promise<void> {
        await this.delete({ user: user });
    }

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
