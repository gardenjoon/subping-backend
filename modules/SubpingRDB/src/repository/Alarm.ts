import { EntityRepository, Repository } from "typeorm";
import { Alarm } from "../entity/Alarm";

@EntityRepository(Alarm)
export class AlarmRepository extends Repository<Alarm> {
    async saveAlarm(Alarm: Alarm): Promise<void> {
        await this.save(Alarm);
    }

    async updateAlarmRead(alarmId: string, read: boolean): Promise<void> {
        await this.update(alarmId, { read: read });
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

    async findUserUnreadAlarms(userId: string) {
        return await this.find({
            user: userId,
            read: false
        });
    }
}