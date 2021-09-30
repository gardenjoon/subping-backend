import SubpingRDB, { Repository } from "subpingrdb";

import { APIGatewayProxyHandler } from 'aws-lambda';
import { success, failure } from "../../libs/response-lib";

export const handler: APIGatewayProxyHandler = async (event, _context) => {
    try {
        const userId = event.headers.id;

        const subpingRDB = new SubpingRDB();
        const connection = await subpingRDB.getConnection("dev");

        const userLikeRepository = connection.getCustomRepository(Repository.UserLike)

        const existUserLike = await userLikeRepository.queryUserLikes(userId);

        return success({
            success: true,
            message: existUserLike
        });
    }

    catch (e) {
        console.log(e);
        return failure({
            success: false,
            message: "getUserLikeServicesException"
        })
    }
}