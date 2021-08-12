import { EntityRepository, Repository } from "typeorm";
import { Product } from "../entity/Product";

@EntityRepository(Product)
export class ProductRepository extends Repository<Product> {
    findAllProduct(): Promise<Product[]> {
        return this.find();
    }

    findOneProduct(id: string): Promise<Product> {
        return this.findOne(id);
    }

    async saveProduct(Product: Product): Promise<void> {
        await this.save(Product);
    }

    async deleteProduct(id: string): Promise<void> {
        await this.delete({ id : id });
    }
}