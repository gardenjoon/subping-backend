import { EntityRepository, Repository } from "typeorm";
import { UserCard } from "../entity/UserCard";

@EntityRepository(UserCard)
export class UserCardRepository extends Repository<UserCard> {
    async getUserCards(userEmail: string, sensitive?: boolean) {
        let query = this.createQueryBuilder("userCard");

        if(sensitive) {
            query = query.select("userCard.*");
        } 

        else {
            query = query.select("userCard.id")
                .addSelect("userCard.user")
                .addSelect("userCard.cardName")
                .addSelect("userCard.cardVendor")
                .addSelect("userCard.method");
        }

        query = query.where(`userCard.user = "${userEmail}"`);
        
        return await query.getRawMany();
    }
}