import {EntityRepository, Repository} from "typeorm";
import { Category } from "../entity/Category";
import { Service } from "../entity/Service";
import { ServiceCategory } from "../entity/ServiceCategory";

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
            .getMany()
    }

    async findServicesWithCategory(name: string) {
        return await this.createQueryBuilder("category")
        .select("category.name", "category")
        .addSelect("service.*")
        .innerJoin("category.serviceCategories", "serviceCategory")
        .where(`category.name = "${name}"`)
        .innerJoin("serviceCategory.service", "service")
        .getRawMany()
    }
}
