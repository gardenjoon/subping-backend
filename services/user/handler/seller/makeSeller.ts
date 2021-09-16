import SubpingRDB, { Repository, Entity } from "subpingrdb";

import { APIGatewayProxyHandler } from 'aws-lambda';
import { success, failure } from "../../libs/response-lib";

export const handler: APIGatewayProxyHandler = async (event, _context) => {
    try {
        const userId = event.headers.id
        const body = JSON.parse(event.body || "");
        const { email, name } = body;


        const subpingRDB = new SubpingRDB();
        const connection = await subpingRDB.getConnection("dev");

        const sellerRepository = connection.getCustomRepository(Repository.Seller);

        const sellerModel = new Entity.Seller();
        sellerModel.id = userId;
        sellerModel.email = email;
        sellerModel.name = name;
        await sellerRepository.save(sellerModel);

        return success({
            success: true,
            message: "MakeSellerSuccess"
        });
    } 

    catch (e) {
        console.log(e);
        return failure({
            success: false,
            message: "MakeSellerException"
        });
    }
}