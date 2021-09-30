import { EntityRepository, Repository } from "typeorm";
import { Product } from "../entity/Product";

@EntityRepository(Product)
export class ProductRepository extends Repository<Product> {
    // 상품 저장
    async createProduct(productModel: Product): Promise<void> {
        await this.save(productModel);
    }

    // 상품 삭제
    async deleteProduct(productId: string): Promise<void> {
        await this.delete({ id : productId });
    }

    //모든 상품 반환
    queryAllProducts(): Promise<Product[]> {
        return this.find();
    }

    //해당 상품 반환
    queryProduct(productId: string): Promise<Product> {
        return this.findOne(productId);
    }

    //해당 서비스의 모든 상품 반환
    async queryProducts(serviceId: string) {
        return await this.createQueryBuilder("product")
            .select("product.*")
            .where(`product.service = "${serviceId}"`)
            .getRawMany();
    }
}