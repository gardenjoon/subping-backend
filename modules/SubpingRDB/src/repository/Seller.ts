import { EntityRepository, Repository } from "typeorm";
import { Seller } from "../entity/Seller";

@EntityRepository(Seller)
export class SellerRepository extends Repository<Seller> {
    findAllSeller(): Promise<Seller[]> {
        return this.find();
    }

    findOneSeller(name: string): Promise<Seller> {
        return this.findOne(name);
    }

    async saveSeller(Seller: Seller): Promise<void> {
        await this.save(Seller);
    }

    async deleteSeller(name: string): Promise<void> {
        await this.delete({ name : name });
    }

    findByName(name: string) {
        return this.createQueryBuilder("name")
            .where("Seller.name = :name", { name })
            .getMany()
    }
}
