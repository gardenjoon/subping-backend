import SubpingRDB, { Repository } from "subpingrdb";

import { APIGatewayProxyHandler } from 'aws-lambda';
import { success, failure } from "../../libs/response-lib";

export const handler: APIGatewayProxyHandler = async (event, _context) => {
    try {
        let response = [];

        const userId = event.headers.id;

        const subpingRDB = new SubpingRDB();
        const coneection = await subpingRDB.getConnection("dev");

        const userLikeRepository = coneection.getCustomRepository(Repository.UserLike)

        const existUserLike = await userLikeRepository.getUserLikes(userId);
        
        response = existUserLike;

        return success({
            success: true,
            message: response
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