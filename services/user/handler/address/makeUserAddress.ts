import SubpingRDB, { Repository, Entity } from "subpingrdb";

import { APIGatewayProxyHandler } from 'aws-lambda';
import { success, failure } from "../../libs/response-lib";

export const handler: APIGatewayProxyHandler = async (event, _context) => {
    try {
        const userId = event.headers.id;
        const body = JSON.parse(event.body || "");
        
        const { userName, userPhoneNumber, postCode, address, detailedAddress, isDefault } = body;

        if (!(userName && postCode && address && detailedAddress && isDefault != null && userPhoneNumber)) {
            return failure({
                success: false,
                message: "MakeAddressParameterException"
            })
        }

        const subpingRDB = new SubpingRDB()
        const connection = await subpingRDB.getConnection("dev");
        const addressRepository = connection.getCustomRepository(Repository.UserAddress);

        const existAddresses = await addressRepository.queryAllUserAddresses(userId);
        let existDefaultAddress;

        for (const address of existAddresses) {
            if (address.isDefault == 1) {
                existDefaultAddress = address;
            }
        }

        // 유저의 주소가 5개 이상일 때 
        if (existAddresses.length >= 5) {
            return failure({
                success: false,
                message: "UserAddressMaxException"
            })
        }

        const userModel = new Entity.User();
        userModel.id = userId;

        const newAddress = new Entity.UserAddress();
        newAddress.user = userModel;
        newAddress.postCode = postCode;
        newAddress.address = address;
        newAddress.detailedAddress = detailedAddress;
        newAddress.isDefault = isDefault;
        newAddress.userName = userName;
        newAddress.userPhoneNumber = userPhoneNumber;

        const queryRunner = connection.createQueryRunner();

        try {
            await queryRunner.startTransaction();

            if (isDefault && existDefaultAddress) {
                await addressRepository.updateUserDefaultAddress(existDefaultAddress.id, false);
            }

            await addressRepository.createUserAddress(newAddress);
        }

        catch (e) {
            console.log(e);
            await queryRunner.rollbackTransaction();
        }

        finally {
            await queryRunner.release();
        }

        return success({
            success: true,
            message: "MakeAddressSuccess"
        })
    }

    catch (e) {
        console.log(e);
        return failure({
            success: false,
            message: "MakeAddressException"
        })
    }
}