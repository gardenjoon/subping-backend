import SubpingRDB, { Repository, Entity } from "subpingrdb";

import { APIGatewayProxyHandler } from 'aws-lambda';
import { success, failure } from "../../libs/response-lib";

export const handler: APIGatewayProxyHandler = async (event, _context) => {
    try {
        const userEmail = event.headers.email;
        const body = JSON.parse(event.body || "");

        const { cardVendor, billingKey, method, pg, cardName } = body;

        const subpingRDB = new SubpingRDB();
        const connection = await subpingRDB.getConnection("dev");
        const userCardRepository = connection.getCustomRepository(Repository.UserCard);

        const userCard = new Entity.UserCard();
        userCard.user = userEmail;
        userCard.billingKey = billingKey;
        userCard.cardName = cardName;
        userCard.cardVendor = cardVendor;
        userCard.method = method;
        userCard.pg = pg;

        await userCardRepository.save(userCard);

        return success({
            success: true,
            message: userCard.id
        });
    }

    catch (e) {
        console.log(e)
        return failure({
            success: false,
            message: "CreateUserCardException"
        });
    }
}