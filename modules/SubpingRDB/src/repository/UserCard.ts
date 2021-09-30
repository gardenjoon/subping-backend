import { EntityRepository, Repository } from "typeorm";
import { UserCard } from "../entity/UserCard";

@EntityRepository(UserCard)
export class UserCardRepository extends Repository<UserCard> {
    // 해당 유저의 카드정보 반환
    async queryUserCards(userId: string, sensitive?: boolean) {
        let query = this.createQueryBuilder("userCard");

        if(sensitive) {
            query = query.select("userCard.*");
        }

        else {
            query = query.select("userCard.id, userCard.user, userCard.cardName, userCard.cardVendor, userCard.method");
        }

        query = query.where(`userCard.user = "${userId}"`);

        return await query.getRawMany();
    }

    // 해당 카드 반환
    async queryUserCard(cardId: string) {
        return this.createQueryBuilder("userCard")
            .select("userCard.*")
            .where(`userCard.id = "${cardId}"`)
            .getRawOne();
    }
}