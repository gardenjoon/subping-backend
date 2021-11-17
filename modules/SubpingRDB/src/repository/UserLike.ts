import { EntityRepository, Repository } from "typeorm";
import { UserLike } from "../entity/UserLike";
import { Service } from "../entity/Service";
import { User } from "../entity/User";

@EntityRepository(UserLike)
export class UserLikeRepository extends Repository<UserLike> {
    // 좋아요 생성
    async createUserLike(userLikeModel: UserLike) {
        await this.save(userLikeModel);
    }

    // 해당 유저의 해당 서비스에 대한 좋아요 제거
    async deleteUserLike(userId: string, serviceId: string) {
        const userModel = new User();
        userModel.id = userId;

        const serviceModel = new Service();
        serviceModel.id = serviceId;

        await this.delete({
            user: userModel,
            service: serviceModel
        });
    }

    // 해당 유저와 해당 서비스의 좋아요 반환
    async queryUserLike(userId: string, serviceId: string) {
        return await this.createQueryBuilder("userLike")
            .where(`userLike.user = "${userId}" AND userLike.service = "${serviceId}"`)
            .getOne();
    }

    // 해당 유저가 좋아요한 모든 서비스 반환
    async queryUserLikes(userId: string) {
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