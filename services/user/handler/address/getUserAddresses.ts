import SubpingRDB, { Repository } from "subpingrdb";

import { APIGatewayProxyHandler } from 'aws-lambda';
import { success, failure } from "../../libs/response-lib";

export const handler: APIGatewayProxyHandler = async (event, _context) => {
    try {
        const userId = event.headers.id;

        const subpingRDB = new SubpingRDB();
        const connection = await subpingRDB.getConnection("dev");
        const addressRepository = connection.getCustomRepository(Repository.UserAddress);

        const addresses = await addressRepository.queryAllUserAddresses(userId);

        return success({
            success: true,
            message: addresses
        })
    }

    catch (e) {
        console.log(e);
        return failure({
            success: false,
            message: "GetUserAddressesException"
        })
    }
}