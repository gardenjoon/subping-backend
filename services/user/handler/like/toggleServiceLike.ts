import SubpingRDB, { Repository, Entity } from "subpingrdb";

import { APIGatewayProxyHandler } from 'aws-lambda';
import { success, failure } from "../../libs/response-lib";

export const handler: APIGatewayProxyHandler = async (event, _context) => {
    try {
        const header = event.headers;
        const PK = header.email;
        const body = JSON.parse(event.body || "");

        const { serviceId } = body;

        const subpingRDB = new SubpingRDB();
        const coneection = await subpingRDB.getConnection("dev");

        const userLikeRepository = coneection.getCustomRepository(Repository.UserLike)
        
        const existUserLike = await userLikeRepository.getUserLike(PK, serviceId);

        if(existUserLike) {
            await userLikeRepository.removeUserLike(existUserLike);
        }

        else {
            const userLikeEntity = new Entity.UserLike();
            userLikeEntity.user = PK;
            userLikeEntity.service = serviceId;
    
            await userLikeRepository.makeUserLike(userLikeEntity);
        }

        return success({
            success: true,
            message: "done"
        });
    }   

    catch (e) {
        console.log(e);
        return failure({
            success: false,
            message: "makeUserLikeException"
        })
    }
} 