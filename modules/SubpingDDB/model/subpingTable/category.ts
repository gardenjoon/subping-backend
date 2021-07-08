import DefaultModel from "./default";

interface CategoryModel extends DefaultModel {
    category:string;
    categorySummary: string;
}
export default CategoryModel;
