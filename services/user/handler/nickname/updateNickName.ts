import SubpingRDB, { Repository } from "subpingrdb";
import { APIGatewayProxyHandler } from 'aws-lambda';

import { success, failure } from "../../libs/response-lib";

export const handler: APIGatewayProxyHandler = async (event, _context) => {
    try {
        const userId = event.headers.id;
        const body = JSON.parse(event.body || "");
        const { nickName } = body;

        const subpingRDB = new SubpingRDB();
        const connection = await subpingRDB.getConnection("dev");
        const UserRepository = connection.getCustomRepository(Repository.User);
        
        const regExp = /^[ㄱ-ㅎ|가-힣|a-z|A-Z|0-9]+$/;

        if(regExp.test(nickName)) {
            await UserRepository.updateUserNickName(userId, nickName)

            return success({
                success: true,
                message: "UpdateNickNameSuccess"
            })
        } 

        else {
            return failure({
                success: false,
                message: "NickNameInvalidException"
            })
        }
    }

    catch (e) {
        console.log(e);
        return failure({
            success: false,
            message: "UpdateNickNameException"
        })
    }
}