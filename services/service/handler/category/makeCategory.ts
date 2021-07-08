import SubpingDDB from "subpingddb";
import CategoryModel from "subpingddb/model/subpingTable/category";
import { APIGatewayProxyHandler } from 'aws-lambda';
import { v4 as uuidv4 } from 'uuid';

import { success, failure } from "../../libs/response-lib";

export const handler: APIGatewayProxyHandler = async (event, _context) => {
    try {
        const subpingDDB = new SubpingDDB(process.env.subpingTable);
        const controller = subpingDDB.getController();

        const servicePK = uuidv4();

        const categoryModel: CategoryModel = {
            PK: `category#${servicePK}`,
            SK: `category#생활`,
            createdAt: null,
            updatedAt: null,
            model: "category",
            category: "생활",
            categorySummary: "생활용품에 관한 카테고리입니다.",
        }
        await controller.create<CategoryModel>(categoryModel);

        return success({
            success: true,
            message: "makeCategorySuccess"
        })
        
    }

    catch (e) {
        console.log(e);
        return failure({
            success: false,
            message: "makeCategoryException"
        })
    }
}