import { EntityRepository, Repository } from "typeorm";
import { Alarm } from "../entity/Alarm";

@EntityRepository(Alarm)
export class AlarmRepository extends Repository<Alarm> {
    async saveAlarm(Alarm: Alarm): Promise<void> {
        await this.save(Alarm);
    }

    async updateAlarmRead(id: string, read: boolean): Promise<void> {
        await this.update(id, { read: read });
    }

    async deleteAlarm(userId: string): Promise<void> {
        await this.delete({ user: userId });
    }

    async findUserAlarms(userId: string) {
        return await this.createQueryBuilder("alarm")
            .select("alarm.*")
            .addSelect(`DATE_ADD(alarm.updatedAt, INTERVAL 9 HOUR)`, "createdAt")
            .addSelect("DATE_ADD(alarm.updatedAt, INTERVAL 9 HOUR)", "updatedAt")
            .where(`alarm.user = "${userId}"`)
            .orderBy("alarm.updatedAt", "DESC")
            .getRawMany();
    }

    async findUserUnreadAlarms(email: string) {
        return await this.find({
            user: email,
            read: false
        });
    }
}