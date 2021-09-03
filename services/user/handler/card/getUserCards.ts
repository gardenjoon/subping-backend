import SubpingRDB, { Repository } from "subpingrdb";

import { APIGatewayProxyHandler } from 'aws-lambda';
import { success, failure } from "../../libs/response-lib";

export const handler: APIGatewayProxyHandler = async (event, _context) => {
    try {
        const userEmail = event.headers.email;

        const subpingRDB = new SubpingRDB();
        const connection = await subpingRDB.getConnection("dev");
        const userCardRepository = connection.getCustomRepository(Repository.UserCard);

        const userCards = await userCardRepository.getUserCards(userEmail, false);

        return success({
            success: true,
            message: userCards
        });
    }

    catch (e) {
        console.log(e)
        return failure({
            success: false,
            message: "GetUserCardsException"
        });
    }
}