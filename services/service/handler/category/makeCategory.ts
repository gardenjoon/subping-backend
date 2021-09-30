import SubpingRDB, { Repository, Entity } from "subpingrdb";

import { APIGatewayProxyHandler } from 'aws-lambda';
import { success, failure } from "../../libs/response-lib";

export const handler: APIGatewayProxyHandler = async (event, _context) => {
    try {
        const body = JSON.parse(event.body || "");

        const { name, summary, categoryLogoUrl } = body;

        const subpingRDB = new SubpingRDB();
        const connection = await subpingRDB.getConnection("dev");
        const categoryRepository = connection.getCustomRepository(Repository.Category);

        const categoryModel = new Entity.Category();
        categoryModel.name = name;
        categoryModel.summary = summary;
        categoryModel.categoryLogoUrl = categoryLogoUrl;
        await categoryRepository.createCategory(categoryModel);

        return success({
            success: true,
            message: "makeCategorySuccess"
        });
    }

    catch (e) {
        console.log(e);
        return failure({
            success: false,
            message: "makeCategoryException"
        });
    }
}