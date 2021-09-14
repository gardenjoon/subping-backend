import { EntityRepository, Repository } from "typeorm";
import { Seller } from "../entity/Seller";

@EntityRepository(Seller)
export class SellerRepository extends Repository<Seller> {
    findAllSeller(): Promise<Seller[]> {
        return this.find();
    }

    findOneSeller(sellerId: string): Promise<Seller> {
        return this.findOne(sellerId);
    }

    async saveSeller(Seller: Seller): Promise<void> {
        await this.save(Seller);
    }

    async deleteSeller(sellerId: string): Promise<void> {
        await this.delete({ id : sellerId });
    }

    findByName(name: string) {
        return this.createQueryBuilder("name")
            .where("Seller.name = :name", { name })
            .getMany();
    }
}