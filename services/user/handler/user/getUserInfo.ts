import SubpingRDB, { Repository } from "subpingrdb";

import { APIGatewayProxyHandler } from 'aws-lambda';
import { success, failure } from "../../libs/response-lib";

export const handler: APIGatewayProxyHandler = async (event, _context) => {
    try {
        const userId = event.headers.id;

        const subpingRDB = new SubpingRDB();
        const connection = await subpingRDB.getConnection("dev");
        const UserRepository = connection.getCustomRepository(Repository.User);

        const user = await UserRepository.findOneUser(userId);

        if(user) {
            return success({
                success: true,
                message: user
            });
        } else {
            return failure({
                success: false,
                message: "NoUserExistException"
            });
        }
    }

    catch (e) {
        console.log(e)
        return failure({
            success: false,
            message: "GetUserInfoException"
        });
    }
}