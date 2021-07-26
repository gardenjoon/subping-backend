import SubpingRDB, { Repository, Entity } from "subpingrdb";

import { APIGatewayProxyHandler } from 'aws-lambda';
import { success, failure } from "../../libs/response-lib";

export const handler: APIGatewayProxyHandler = async (event, _context) => {
    try {
        const subpingRDB = new SubpingRDB();
        const connection = await subpingRDB.getConnection("dev");
        const repository = connection.getCustomRepository(Repository.CategoryRepository)

        const categoryModel = new Entity.Category();

        categoryModel.name = "사회"
        categoryModel.summary = "정치, 뉴스, 연예에 관한 카테고리입니다"
        categoryModel.categoryLogoUrl = null

        await repository.save(categoryModel)

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
