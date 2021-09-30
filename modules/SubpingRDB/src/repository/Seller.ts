import { EntityRepository, Repository } from "typeorm";
import { Seller } from "../entity/Seller";

@EntityRepository(Seller)
export class SellerRepository extends Repository<Seller> {
    // 판매자 생성
    async createSeller(sellerModel: Seller): Promise<void> {
        await this.save(sellerModel);
    }

    // 판매자 제거
    async deleteSeller(sellerId: string): Promise<void> {
        await this.delete({ id : sellerId });
    }

    // 모든 판매자 반환
    queryAllSeller(): Promise<Seller[]> {
        return this.find();
    }

    // 해당 판매자 반환
    queryOneSeller(sellerId: string): Promise<Seller> {
        return this.findOne(sellerId);
    }
}