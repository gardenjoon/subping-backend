import {EntityRepository, Repository} from "typeorm";
import { User } from "../entity/User";

@EntityRepository(User)
export class UserRepository extends Repository<User> {
    findAllUser(): Promise<User[]> {
        return this.find();
    }

    findOneUser(email: string): Promise<User> {
        return this.findOne(email);
    }

    async saveUser(user: User): Promise<void> {
        await this.save(user);
    }

    async deleteUser(email: string): Promise<void> {
        await this.delete({ email: email });
    }

    findByName(name: string) {
        return this.createQueryBuilder("user")
            .where("user.name = :name", { name })
            .getMany()
    }
}
