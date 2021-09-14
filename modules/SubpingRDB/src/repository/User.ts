import { EntityRepository, Repository } from "typeorm";
import { User } from "../entity/User";

@EntityRepository(User)
export class UserRepository extends Repository<User> {
    findAllUser(): Promise<User[]> {
        return this.find();
    }

    findOneUser(userId: string): Promise<User> {
        return this.findOne(userId);
    }

    async updateNickName(userId: string, nickName: string): Promise<void> {
        await this.update(userId, { nickName: nickName})
    }

    async saveUser(User: User): Promise<void> {
        await this.save(User);
    }

    async deleteUser(userId: string): Promise<void> {
        await this.delete({ id: userId });
    }

    async findByName(userName: string) {
        return this.createQueryBuilder("user")
            .where(`user.userName = ${userName}`)
            .getMany()
    }

    async findByNickName(nickName: string): Promise<Object> {
        return await this.createQueryBuilder("user")
            .where(`user.nickName = "${nickName}"`)
            .getRawOne();
    }
}