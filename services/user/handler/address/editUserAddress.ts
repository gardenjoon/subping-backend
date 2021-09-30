import SubpingRDB, { Repository } from "subpingrdb";

import { APIGatewayProxyHandler } from 'aws-lambda';
import { success, failure } from "../../libs/response-lib";

export const handler: APIGatewayProxyHandler = async (event, _context) => {
    try {
        const userId = event.headers.id;
        const body = JSON.parse(event.body || "");

        const { addressId, userName, userPhoneNumber, postCode, address, detailedAddress, isDefault } = body;

        const subpingRDB = new SubpingRDB();
        const connection = await subpingRDB.getConnection("dev");

        const userAddressRepository = connection.getCustomRepository(Repository.UserAddress);
        const defaultAddress = await userAddressRepository.queryUserDefaultAddress(userId);
        const targetAddress = await userAddressRepository.queryUserAddress(addressId);

        if(targetAddress.userId != userId) {
            return failure({
                success: false,
                message: "EditUserAddressException"
            });
        }

        if (defaultAddress && defaultAddress.id != addressId && isDefault){
            await userAddressRepository.updateUserDefaultAddress(defaultAddress.id, false);
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