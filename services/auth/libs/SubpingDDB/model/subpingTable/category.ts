import DefaultModel from "./default";

interface CategoryModel extends DefaultModel {
    category: string;
    categoryCode: string;
    categorySummary: string;
}
export default CategoryModel;
