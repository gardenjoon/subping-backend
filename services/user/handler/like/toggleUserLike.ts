import SubpingRDB, { Repository, Entity } from "subpingrdb";

import { APIGatewayProxyHandler } from 'aws-lambda';
import { success, failure } from "../../libs/response-lib";

export const handler: APIGatewayProxyHandler = async (event, _context) => {
    try {
        const header = event.headers;
        const PK = header.email;
        const body = JSON.parse(event.body || "");

        const { serviceId, toggle } = body;

        const subpingRDB = new SubpingRDB();
        const connection = await subpingRDB.getConnection("dev");

        const userLikeRepository = connection.getCustomRepository(Repository.UserLike);
        const existUserLike = await userLikeRepository.getUserLike(PK, serviceId);
        
        const userLikeEntity = new Entity.UserLike();
        userLikeEntity.user = PK;
        userLikeEntity.service = serviceId;

        // 만약 토글이 true이고 이미 유저 라이크가 없으면, 생성
        if(toggle && !existUserLike) {
            await userLikeRepository.makeUserLike(userLikeEntity);

            return success({
                success: true,
                message: true
            });
        }

        // 만약 토글이 false이고 이미 유저 라이크가 있으면, 제거
        else if(!toggle && existUserLike) {
            await userLikeRepository.removeUserLike(PK, serviceId);
    
            return success({
                success: true,
                message: false
            });
        }

        return success({
            success: true,
            message: existUserLike ? true : false
        });
    }

    catch (e) {
        console.log(e);
        return failure({
            success: false,
            message: "makeUserLikeException"
        });
    }
}