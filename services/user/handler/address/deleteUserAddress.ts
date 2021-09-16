import SubpingRDB, { Repository } from "subpingrdb";

import { APIGatewayProxyHandler } from 'aws-lambda';
import { success, failure } from "../../libs/response-lib";

export const handler: APIGatewayProxyHandler = async (event, _context) => {
    try {
        
        const userEmail = event.headers.email;
        const body = JSON.parse(event.body || "");

        const { addressId } = body;

        const subpingRDB = new SubpingRDB();
        const connection = await subpingRDB.getConnection("dev");

        const userAddressRepository = connection.getCustomRepository(Repository.UserAddress);
        const targetAddress = await userAddressRepository.getAddress(addressId);

        if(targetAddress.userEmail != userEmail) {
            return failure({
                success: false,
                message: "DeleteAddresUserException"
            });
        }

        userAddressRepository.deleteUserAddress(addressId);

        return success({
            success: true,
            message: "DeleteUserAddressSuccess"
        });
    }

    catch (e) {
        console.log(e);
        return failure({
            success: false,
            message: "DeleteUserAddressException"
        });
    }
}