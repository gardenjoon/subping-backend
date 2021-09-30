import { EntityRepository, Repository } from "typeorm";
import { Category } from "../entity/Category";

@EntityRepository(Category)
export class CategoryRepository extends Repository<Category> {
    // 카테고리 저장
    async createCategory(categoryModel: Category): Promise<void> {
        await this.save(categoryModel);
    }

    // 카테고리 이름으로 카테고리 삭제
    async deleteCategory(categoryName: string): Promise<void> {
        await this.delete({ name : categoryName });
    }

    // 모든 카테고리 반환
    queryAllCategories(): Promise<Category[]> {
        return this.find();
    }

    // 카테고리 이름으로 해당 카테고리 반환
    queryCategory(categoryName: string): Promise<Category> {
        return this.findOne(categoryName);
    }
}