import SubpingRDB, { Repository } from "subpingrdb";
import { APIGatewayProxyHandler } from 'aws-lambda';

import { success, failure } from "../../libs/response-lib";

export const handler: APIGatewayProxyHandler = async (event, _context) => {
    try {
        const body = JSON.parse(event.body || "");
        const nickName =  body.nickName;

        const header = event.headers;
        const userEmail = header.email;

        const subpingRDB = new SubpingRDB();
        const connection = await subpingRDB.getConnection("dev");
        const UserRepository = connection.getCustomRepository(Repository.User);

        await UserRepository.updateNickName(userEmail, nickName)

        return success({
            success: true,
            message: "UpdateNickNameSuccess"
        })
    }
    
    catch (e) {
        console.log(e);
        return failure({
            success: false,
            message: "UpdateNickNameException"
        })
    }
}