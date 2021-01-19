import { v4 as uuidv4 } from 'uuid';
import SubpingDDB from "subpingddb";
import AddressModel from "subpingddb/model/subpingTable/address";
import DefaultAddressModel from "subpingddb/model/subpingTable/defaultAddress";
import { APIGatewayProxyHandler } from 'aws-lambda';

import { success, failure } from "../../libs/response-lib";

export const handler: APIGatewayProxyHandler = async (event, _context) => {
    try {
        const header = event.headers;
        const PK = header.pk;
        const body = JSON.parse(event.body || "");
        const uuid = uuidv4();

        console.log(PK, body);

        const { addressName, postCode, address, detailedAddress, isDefault } = body;

        // 테스트 코드
        // const PK = "jsw9088@gmail.com"
        // const { addressName, postCode, address, detailedAddress, isDefault } = { addressName: "test2", postCode: "test", address: "test", detailedAddress: "test", isDefault: true };

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
        }

        const addressModel: AddressModel = {
            PK: PK,
            SK: `address#${uuid}`,
            model: "address",
            createdAt: null,
            updatedAt: null,
            addressName: addressName,
            postCode: postCode,
            address: address,
            detailedAddress: detailedAddress,
        };

        await controller.create<AddressModel>(addressModel);

        // 기본 주소일때 기본주소 업데이트
        if (isDefault) {
            const defaultAddress = (await controller.read("model-PK-Index", "defaultAddress", PK)).Items[0];

            if (!defaultAddress) {
                const property: DefaultAddressModel = {
                    PK: PK,
                    SK: "defaultAddress",
                    model: "defaultAddress",
                    createdAt: null,
                    updatedAt: null,
                    defaultAddress: `address#${uuid}`
                }

                await controller.create<DefaultAddressModel>(property);
            }

            else {
                await controller.update(defaultAddress.PK, defaultAddress.SK, {
                    defaultAddress: `address#${uuid}`
                })
            }
        }

        return success({
            success: true,
            message: "done"
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
