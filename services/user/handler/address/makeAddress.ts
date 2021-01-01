import SubpingDDB from "subpingddb"
import AddressModel from "subpingddb/model/subpingTable/address"
import { APIGatewayProxyHandler } from 'aws-lambda';

import { success, failure } from "../../libs/response-lib";

export const handler: APIGatewayProxyHandler = async (event, _context) => {
    try {
        console.log(event.body);
        const header = event.headers;
        const PK = header.pk;
        const body = JSON.parse(event.body || "");

        console.log(PK, body);

        const { addressName, postCode, address, detailedAddress, isDefault } = body;

        if (!(addressName && postCode && address && detailedAddress && isDefault)) {
            return failure({
                success: false,
                message: "ParameterMissMatchException"
            })
        }

        const subpingDDB = new SubpingDDB(process.env.subpingTable);
        const controller = subpingDDB.getController();

        const existAddress: AddressModel[] = (await controller.read("model-PK-Index", "address", PK)).Items;

        // 유저의 주소가 5개 이상일 때 
        if (existAddress.length >= 5) {
            return failure({
                success: false,
                message: "UserAddressMaxException"
            })
        }

        for (const address of existAddress) {
            // 같은 이름의 주소가 있을 떄
            if (address.SK === addressName) {
                return failure({
                    success: false,
                    message: "UserAddressNameDuplicatedException"
                })
            }

            // 기본 주소가 이미 있고, 추가하는 주소가 기본 주소일 떄 기본주소 변경
            if (isDefault && address.isDefault) {
                await controller.update(address.PK, address.SK, { isDefault: false });
            }
        }

        const addressModel: AddressModel = {
            PK: PK,
            SK: addressName,
            model: "address",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            addressName: addressName,
            postCode: postCode,
            address: address,
            detailedAddress: detailedAddress,
            isDefault: isDefault,
        };

        await controller.create<AddressModel>(addressModel);

        return success({
            success: true,
            message: "done"
        })
    }

    catch (e) {
        console.error(e);
        return failure({
            success: false,
            message: "MakeAddressException"
        })
    }
}
