import { EntityRepository, Repository } from "typeorm";
import { UserLike } from "../entity/UserLike";

@EntityRepository(UserLike)
export class UserLikeRepository extends Repository<UserLike> {
    async makeUserLike(userLike: UserLike) {
        await this.save(userLike);
    }

    async removeUserLike(userEmail: string, serviceId: string) {
        await this.delete({
            user: userEmail,
            service: serviceId
        });
    }

    async getUserLike(userEmail: string, serviceId: string) {
        return await this.createQueryBuilder("userLike")
            .where("userLike.user = :userEmail AND userLike.service = :serviceId", { userEmail: userEmail, serviceId: serviceId })
            .getOne();
    }

    async getUserLikes(userEmail: string) {
        return await this.createQueryBuilder("userLike")
            .select("service.*")
            .addSelect("IF(userLike.createdAt IS NULL, False, True)", "like")
            .innerJoin("userLike.service", "service", `userLike.user = "${userEmail}"`)
            .getRawMany();
    }
}