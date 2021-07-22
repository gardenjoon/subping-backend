import {EntityRepository, Repository} from "typeorm";
import {User} from "../entity/User";

@EntityRepository(User)
export class UserRepository extends Repository<User> {
    async createUser(user: User) {
        return this.save(user);        
    }
}