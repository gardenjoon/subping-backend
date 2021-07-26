import SubpingRDB, { Repository } from "subpingrdb";

import { APIGatewayProxyHandler } from 'aws-lambda';
import { success, failure } from "../../libs/response-lib";

export const handler: APIGatewayProxyHandler = async (event, _context) => {
    try {
        const subpingRDB = new SubpingRDB();
        const connection = await subpingRDB.getConnection("dev");
        await connection.synchronize();

        const sellerRepository = connection.getCustomRepository(Repository.SellerRepository)
        
        const sellerModel = new Repository.SellerRepository();
        sellerModel.email = "wonjoon@joiple.co"
        sellerModel.name = "정원준"
        
        await sellerRepository.save(sellerModel)

        console.log(await sellerRepository.findAllSeller())
        return success({
            success: true,
            message: "MakeSellerSuccess"
        })
    } 

    catch (e) {
        console.log(e);
        return failure({
            success: false,
            message: "MakeSellerException"
        })
    }
}

