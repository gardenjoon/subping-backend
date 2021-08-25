import { EntityRepository, Repository } from "typeorm";
import { Category } from "../entity/Category";

@EntityRepository(Category)
export class CategoryRepository extends Repository<Category> {
    findAllCategory(): Promise<Category[]> {
        return this.find();
    }

    findOneCategory(name: string): Promise<Category> {
        return this.findOne(name);
    }

    async saveCategory(Category: Category): Promise<void> {
        await this.save(Category);
    }

    async deleteCategory(name: string): Promise<void> {
        await this.delete({ name : name });
    }

    findByCategory(name: string) {
        return this.createQueryBuilder("name")
            .where("Category.name = :name", { name })
            .getMany();
    }
}