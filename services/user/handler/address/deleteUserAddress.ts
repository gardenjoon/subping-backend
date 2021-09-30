import SubpingRDB, { Repository } from "subpingrdb";

import { APIGatewayProxyHandler } from 'aws-lambda';
import { success, failure } from "../../libs/response-lib";

export const handler: APIGatewayProxyHandler = async (event, _context) => {
    try {
        const userId = event.headers.id;
        const body = JSON.parse(event.body || "");

        const { addressId } = body;

        const subpingRDB = new SubpingRDB();
        const connection = await subpingRDB.getConnection("dev");

        const userAddressRepository = connection.getCustomRepository(Repository.UserAddress);
        const targetAddress = await userAddressRepository.queryUserAddress(addressId);

        //  요청된 유저와 지울 주소의 유저가 다르면 에러 반환
        if (targetAddress.userId != userId) {
            return failure({
                success: false,
                message: "DeleteUserAddressException"
            });
        }

        await userAddressRepository.deleteUserAddress(addressId);

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