import SubpingRDB, { Repository } from "subpingrdb";

import { APIGatewayProxyHandler } from 'aws-lambda';
import { success, failure } from "../../libs/response-lib";

export const handler: APIGatewayProxyHandler = async (event, _context) => {
    try {
        let response = [];

        const header = event.headers;
        const PK = header.email;

        const subpingRDB = new SubpingRDB();
        const coneection = await subpingRDB.getConnection("dev");

        const userLikeRepository = coneection.getCustomRepository(Repository.UserLike)

        const existUserLike = await userLikeRepository.getUserLikes(PK);
        
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