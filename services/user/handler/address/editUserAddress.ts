import SubpingRDB, { Repository } from "subpingrdb";

import { APIGatewayProxyHandler } from 'aws-lambda';
import { success, failure } from "../../libs/response-lib";

export const handler: APIGatewayProxyHandler = async (event, _context) => {
    try {
        const userEmail = event.headers.email;
        const body = JSON.parse(event.body || "");

        const { addressId, userName, userPhoneNumber, postCode, address, detailedAddress, isDefault } = body;

        const subpingRDB = new SubpingRDB();
        const connection = await subpingRDB.getConnection("dev");

        const userAddressRepository = connection.getCustomRepository(Repository.UserAddress);
        const defaultAddress = await userAddressRepository.getUserDefaultAddress(userEmail);

        if (defaultAddress.id != addressId){
            await userAddressRepository.updateAddressDefault(defaultAddress.id, false);
        };

        await userAddressRepository.updateUserAddress(addressId, {
            userName: userName,
            userPhoneNumber: userPhoneNumber,
            postCode: postCode,
            address: address,
            detailedAddress: detailedAddress,
            isDefault: isDefault
        });

        return success({
            success: true,
            message: "editUserAddressSuccess"
        });
    }

    catch (e) {
        console.log(e);
        return failure({
            success: false,
            message: "editUserAddressException"
        });
    }
}