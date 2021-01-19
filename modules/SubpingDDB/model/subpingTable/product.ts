import DefaultModel from "./default"

interface ProductModel extends DefaultModel {
    productName: string;
    productPrice: number;
    productSummary: string;
}

export default ProductModel;