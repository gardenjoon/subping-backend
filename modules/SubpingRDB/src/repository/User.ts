import { EntityRepository, Repository } from "typeorm";
import { User } from "../entity/User";

@EntityRepository(User)
export class UserRepository extends Repository<User> {
    // 유저 생성
    async createUser(userModel: User): Promise<void> {
        await this.save(userModel);
    }

    // 해당 유저의 닉네임 업데이트
    async updateUserNickName(userId: string, nickName: string): Promise<void> {
        await this.update(userId, { nickName: nickName})
    }

    // 해당 유저 제거
    async deleteUser(userId: string): Promise<void> {
        await this.delete({ id: userId });
    }

    // 모든 유저 반환
    queryAllUsers(): Promise<User[]> {
        return this.find();
    }

    // 해당 유저 반환
    queryUser(userId: string): Promise<User> {
        return this.findOne(userId);
    }

    // 해당 닉네임의 유저 반환
    async queryUserByNickName(nickName: string): Promise<Object> {
        return await this.createQueryBuilder("user")
            .where(`nickName = "${nickName}"`)
            .getOne();
    }
}