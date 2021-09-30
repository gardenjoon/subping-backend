import { EntityRepository, Repository } from "typeorm";
import { Alarm } from "../entity/Alarm";

@EntityRepository(Alarm)
export class AlarmRepository extends Repository<Alarm> {
    // 알림 생성
    async createAlarm(alarmModel: Alarm): Promise<void> {
        await this.save(alarmModel);
    }

    // 알림 제거
    async deleteAlarm(userId: string): Promise<void> {
        await this.delete({ user: userId });
    }

    // 해당 유저의 모든알림 반환
    async queryAlarms(userId: string) {
        return await this.createQueryBuilder("alarm")
            .select("alarm.*")
            .addSelect(`DATE_ADD(alarm.updatedAt, INTERVAL 9 HOUR)`, "createdAt")
            .addSelect("DATE_ADD(alarm.updatedAt, INTERVAL 9 HOUR)", "updatedAt")
            .where(`alarm.user = "${userId}"`)
            .orderBy("alarm.updatedAt", "DESC")
            .getRawMany();
    }

    // 해당 유저의 읽지않은 알림 반환
    async queryUnreadAlarms(userId: string) {
        return await this.find({
            user: userId,
            read: false
        });
    }

    // 안읽은 알림을 읽음으로 업데이트
    async updateAlarmToRead(alarmId: string): Promise<void> {
        await this.update(alarmId, { read: true });
    }
}