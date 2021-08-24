import { EntityRepository, Repository } from "typeorm";
import { User } from "../entity/User";

@EntityRepository(User)
export class UserRepository extends Repository<User> {
    findAllUser(): Promise<User[]> {
        return this.find();
    }

    findOneUser(userEmail: string): Promise<User> {
        return this.findOne(userEmail);
    }

    async updateNickName(userEmail: string, nickName: string): Promise<void> {
        await this.update(userEmail, { nickName: nickName})
    }

    async saveUser(User: User): Promise<void> {
        await this.save(User);
    }

    async deleteUser(userEmail: string): Promise<void> {
        await this.delete({ email: userEmail });
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