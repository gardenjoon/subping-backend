import SubpingRDB, { Repository, Entity } from "subpingrdb";

import { APIGatewayProxyHandler } from 'aws-lambda';
import { success, failure } from "../../libs/response-lib";

export const handler: APIGatewayProxyHandler = async (event, _context) => {
    try {
        const userId = event.headers.id;
        const body = JSON.parse(event.body || "");

        const { serviceId, toggle } = body;

        const subpingRDB = new SubpingRDB();
        const connection = await subpingRDB.getConnection("dev");

        const userLikeRepository = connection.getCustomRepository(Repository.UserLike);
        const existUserLike = await userLikeRepository.queryUserLike(userId, serviceId);
        
        const userModel = new Entity.User();
        userModel.id = userId;

        const serviceModel = new Entity.Service();
        serviceModel.id = serviceId
        
        const userLikeModel = new Entity.UserLike();
        userLikeModel.user = userModel;
        userLikeModel.service = serviceModel;

        // 만약 토글이 true이고 존재하는 좋아요가 없으면, 생성
        if(toggle && !existUserLike) {
            await userLikeRepository.createUserLike(userLikeModel);

            return success({
                success: true,
                message: true
            });
        }

        // 만약 토글이 false이고 존재하는 좋아요가 있으면, 제거
        else if(!toggle && existUserLike) {
            await userLikeRepository.deleteUserLike(userId, serviceId);

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