import SubpingRDB, { Repository } from "subpingrdb";

import { APIGatewayProxyHandler } from 'aws-lambda';
import { success, failure } from "../../libs/response-lib";

export const handler: APIGatewayProxyHandler = async (_event, _context) => {
    try {
        const subpingRDB = new SubpingRDB();
        const connection = await subpingRDB.getConnection("dev");
        const categoryRepository = connection.getCustomRepository(Repository.Category);

        const response = await categoryRepository.queryAllCategories();

        return success({
            success: true,
            message: response 
        });
    }

    catch (e) {
        console.log(e);
        return failure({
            success: false,
            message: "GetCategoriesException"
        });
    }
}