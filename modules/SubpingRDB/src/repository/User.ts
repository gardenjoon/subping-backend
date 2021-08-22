import {EntityRepository, Repository} from "typeorm";
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

    findByName(userName: string) {
        return this.createQueryBuilder("user")
            .where(`user.userName = ${userName}`)
            .getMany()
    }

    async duplicateNickName(userEmail: string, nickName: string): Promise<Object> {
        const result = {
            duplicate: false,
            invalid: false
        };

        const regExp = /^[ㄱ-ㅎ|가-힣|a-z|A-Z|0-9]+$/;

        const duplicate = await this.createQueryBuilder("user")
            .select("user.nickName", "nickName")
            .where(`user.email != "${userEmail}"`)
            .andWhere(`user.nickName = "${nickName}"`)
            .getRawOne();

        result.duplicate = (duplicate) ? true : false;
        result.invalid = (regExp.test(nickName)) ? false : true;

        return result;
    }
}