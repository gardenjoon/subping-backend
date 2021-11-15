import SubpingRDB, { Repository } from "subpingrdb";

import { APIGatewayProxyHandler } from 'aws-lambda';
import { success, failure } from "../../libs/response-lib";

export const handler: APIGatewayProxyHandler = async (event, _context) => {
    try {
        const userId = event.headers.id;
        const body = JSON.parse(event.body || "");

        const { cardId } = body;

        const subpingRDB = new SubpingRDB();
        const connection = await subpingRDB.getConnection("dev");
        const userCardRepository = connection.getCustomRepository(Repository.UserCard);

        const targetCard = await userCardRepository.findOne({ id: cardId });

        if(targetCard) {
            if(targetCard.userId == userId) {
                await userCardRepository.delete({
                    id: cardId
                });

                return success({
                    success: true,
                    message: "DeleteUserCardSuccess"
                });

            } else {
                return failure({
                    success: false,
                    message: "WrongAccessUserCardException"
                }); 
            }

        } else {
            return failure({
                success: false,
                message: "WrongAccessUserCardException"
            });
        }
    }

    catch (e) {
        console.log(e)
        return failure({
            success: false,
            message: "DeleteUserCardException"
        });
    }
}