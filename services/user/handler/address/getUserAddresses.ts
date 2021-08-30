import { APIGatewayProxyHandler } from 'aws-lambda';
import SubpingRDB, { Repository } from "subpingrdb";

import { success, failure } from "../../libs/response-lib";


export const handler: APIGatewayProxyHandler = async (event, _context) => {
    try {
        const header = event.headers;
        const PK = header.email;

        const subpingRDB = new SubpingRDB();
        const connection = await subpingRDB.getConnection("dev");
        const addressRepository = connection.getCustomRepository(Repository.UserAddress);

        const addresses = await addressRepository.getUserAddresses(PK);

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
