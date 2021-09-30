import SubpingRDB, { Repository } from "subpingrdb";

import { APIGatewayProxyHandler } from 'aws-lambda';
import { success, failure } from "../../libs/response-lib";

export const handler: APIGatewayProxyHandler = async (event, _context) => {
    try {
        const body = JSON.parse(event.body || "");
        const { nickName } = body;

        const subpingRDB = new SubpingRDB();
        const connection = await subpingRDB.getConnection("dev");
        const userRepository = connection.getCustomRepository(Repository.User);

        const user = await userRepository.queryUserByNickName(nickName);

        return success({
            success: true,
            message: user ? true : false
        });
    }

    catch (e) {
        console.log(e)
        return failure({
            success: false,
            message: "duplicateNickNameException"
        });
    }
}