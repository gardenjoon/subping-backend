import { EntityRepository, Repository } from "typeorm";
import { UserLike } from "../entity/UserLike";

@EntityRepository(UserLike)
export class UserLikeRepository extends Repository<UserLike> {
    async makeUserLike(userLike: UserLike) {
        await this.save(userLike);
    }

    async removeUserLike(userLike: UserLike) {
        await this.remove(userLike);
    }

    async getUserLike(userEmail: String, serviceId: String) {
        return await this.createQueryBuilder("userLike")
            .where("userLike.user = :userEmail AND userLike.service = :serviceId", { userEmail: userEmail, serviceId: serviceId })
            .getOne();
    }

    async getUserLikes(userEmail: String) {
        return await this.createQueryBuilder("userLike")
            .where("userLike.user = :userEmail", { userEmail: userEmail })
            .getMany();
    }
}
