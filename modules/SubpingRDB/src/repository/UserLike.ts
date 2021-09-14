import { EntityRepository, Repository } from "typeorm";
import { UserLike } from "../entity/UserLike";

@EntityRepository(UserLike)
export class UserLikeRepository extends Repository<UserLike> {
    async makeUserLike(userLike: UserLike) {
        await this.save(userLike);
    }

    async removeUserLike(userId: string, serviceId: string) {
        await this.delete({
            user: userId,
            service: serviceId
        });
    }

    async getUserLike(userId: string, serviceId: string) {
        return await this.createQueryBuilder("userLike")
            .where(`userLike.user = "${userId}" AND userLike.service = "${serviceId}"`)
            .getOne();
    }

    async getUserLikes(userId: string) {
        const result = await this.createQueryBuilder("userLike")
            .select("service.*")
            .addSelect("IF(userLike.createdAt IS NULL, False, True)", "like")
            .innerJoin("userLike.service", "service", `userLike.user = "${userId}"`)
            .addSelect("GROUP_CONCAT(DISTINCT serviceTag.tag)", "tag")
            .innerJoin("service.serviceTags", "serviceTag")
            .groupBy("service.id")
            .getRawMany();

        result.map(service => {
            service.tag = service.tag.split(",");
        })

        return result;
    }
}