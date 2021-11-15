import { APIGatewayProxyEvent } from "aws-lambda";
// import { handler as makeUserAddress } from "../handler/address/makeUserAddress";
import { handler as editUserAddress } from "../handler/address/editUserAddress";
import { handler as getUserAddresses } from "../handler/address/getUserAddresses";
import { handler as deleteUserAddress } from "../handler/address/deleteUserAddress";
import { UserAddressRepository } from "subpingrdb/dist/src/repository/UserAddress";
import SubpingRDB from "subpingrdb";
import { mocked } from "ts-jest/utils";

let event: APIGatewayProxyEvent = {
    headers: {
        id : "5c1547f2-1049-4d64-8a0a-3140931127e9"
    }
} as any;

let jsonEvent = {};
mocked(SubpingRDB).prototype.getConnection("dev");

const mJsonParse = jest.fn();
JSON.parse = mJsonParse;

const userAddressRepository = UserAddressRepository.prototype;

describe("service", () => {
    test("editUserAddress", async () => {
        const expectDefaultAddress = {
            userName: '정승우',
            userPhoneNumber: '010-1111-1111',
            postCode: '48513',
            address: '부산 남구 용소로 45 부경대학교',
            detailedAddress: '구학 2098호',
            isDefault: 1,
            createdAt: '2021-09-29T10:39:29.833Z',
            updatedAt: '2021-09-29T11:14:25.913Z',
            userId: '5c1547f2-1049-4d64-8a0a-3140931127e9',
            id: '5e972102-3068-4d11-adfe-18b02bfaabaa',
            subscribeId: null
        };
        const expectTargetAddress = {
            userName: '정승우',
            userPhoneNumber: '010-2222-2222',
            postCode: '48513',
            address: '부산 남구 용소로 45 부경대학교',
            detailedAddress: '공학1관',
            isDefault: 0,
            createdAt: '2021-09-29T10:39:30.528Z',
            updatedAt: '2021-10-02T08:44:07.000Z',
            userId: '5c1547f2-1049-4d64-8a0a-3140931127e9',
            id: '797df1b9-1e2e-47f7-a2c7-443f82e16baa',
            subscribeId: null
        };
        jsonEvent = {
            addressId : "797df1b9-1e2e-47f7-a2c7-443f82e16baa",
            userName : '정승우',
            userPhoneNumber : '010-2222-2222',
            postCode : '48513',
            address : '부산 남구 용소로 45 부경대학교',
            detailedAddress : '공학1관',
            isDefault : true
        };
        JSON.parse = jest.fn(() => (jsonEvent));
        userAddressRepository.queryUserDefaultAddress = jest.fn().mockImplementation(() => (expectDefaultAddress));
        userAddressRepository.queryUserAddress = jest.fn().mockImplementation(() => (expectTargetAddress));
        userAddressRepository.updateUserDefaultAddress = jest.fn();
        userAddressRepository.updateUserAddress = jest.fn();

        const result = await editUserAddress(event, null, null);
        expect(result).toHaveProperty("statusCode", 200);
        expect(result).toHaveProperty("body", expect.stringMatching('"success":true'));
        expect(userAddressRepository.queryUserDefaultAddress).toHaveBeenCalledTimes(1);
        expect(userAddressRepository.queryUserAddress).toHaveBeenCalledTimes(1);
        expect(userAddressRepository.updateUserDefaultAddress).toHaveBeenCalledTimes(1);
        expect(userAddressRepository.updateUserAddress).toHaveBeenCalledTimes(1);
    })

    test("getUserAddresses", async () => {
        const expectResult = [
            {
                userName: '정승우',
                userPhoneNumber: '010-1111-1111',
                postCode: '48513',
                address: '부산 남구 용소로 45 부경대학교',
                detailedAddress: '구학 2098호',
                isDefault: 1,
                createdAt: '2021-09-29T10:39:29.833Z',
                updatedAt: '2021-09-29T11:14:25.913Z',
                userId: '5c1547f2-1049-4d64-8a0a-3140931127e9',
                id: '5e972102-3068-4d11-adfe-18b02bfaabaa',
                subscribeId: null
            },
            {
                userName: '정승우',
                userPhoneNumber: '010-2222-2222',
                postCode: '48513',
                address: '부산 남구 용소로 45 부경대학교',
                detailedAddress: '공학1관',
                isDefault: 0,
                createdAt: '2021-09-29T10:39:30.528Z',
                updatedAt: '2021-10-02T08:44:07.000Z',
                userId: '5c1547f2-1049-4d64-8a0a-3140931127e9',
                id: '797df1b9-1e2e-47f7-a2c7-443f82e16baa',
                subscribeId: null
            }
        ];
       userAddressRepository.queryAllUserAddresses = jest.fn().mockImplementation(() => (expectResult));

        const result = await getUserAddresses(event, null, null);
        expect(result).toHaveProperty("statusCode", 200);
        expect(result).toHaveProperty("body", expect.stringMatching('"success":true'));
        expect(userAddressRepository.queryAllUserAddresses).toHaveBeenCalledTimes(1);
    })

    test("deleteUserAddress", async () => {
        const expectTargetAddress = {
            userName: '정승우',
            userPhoneNumber: '010-2222-2222',
            postCode: '48513',
            address: '부산 남구 용소로 45 부경대학교',
            detailedAddress: '공학1관',
            isDefault: 0,
            createdAt: '2021-09-29T10:39:30.528Z',
            updatedAt: '2021-10-02T08:44:07.000Z',
            userId: '5c1547f2-1049-4d64-8a0a-3140931127e9',
            id: '797df1b9-1e2e-47f7-a2c7-443f82e16baa',
            subscribeId: null
        };
        jsonEvent = {
            addressId : "797df1b9-1e2e-47f7-a2c7-443f82e16baa"
        };
        JSON.parse = jest.fn(() => (jsonEvent));
        userAddressRepository.queryUserAddress = jest.fn().mockImplementation(() => (expectTargetAddress));
        userAddressRepository.deleteUserAddress = jest.fn();

        const result = await deleteUserAddress(event, null, null);
        expect(result).toHaveProperty("statusCode", 200);
        expect(result).toHaveProperty("body", expect.stringMatching('"success":true'));
        expect(userAddressRepository.queryUserAddress).toHaveBeenCalledTimes(1);
        expect(userAddressRepository.deleteUserAddress).toHaveBeenCalledTimes(1);
    })
})