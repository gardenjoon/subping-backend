import { APIGatewayProxyEvent } from "aws-lambda";
import { handler as getUserInfo } from "../handler/user/getUserInfo";
import { UserRepository } from "subpingrdb/dist/src/repository/User";
import SubpingRDB from "subpingrdb";
import { mocked } from "ts-jest/utils";

let event: APIGatewayProxyEvent = {
    headers: {
        id : "5c1547f2-1049-4d64-8a0a-3140931127e9"
    }
} as any;

mocked(SubpingRDB).prototype.getConnection("dev");

describe('user', () => {
    test('getUserInfo', async () => {
        const expectResult = {
            id: '5c1547f2-1049-4d64-8a0a-3140931127e9',
            email: 'jsw9808@gmail.com',
            name: '정승우',
            nickName: '운영자1',
            userProfileImageUrl: 'https://subping-assets.s3.ap-northeast-2.amazonaws.com/serviceLogo/watcha.png',
            birthday: '1998-08-03',
            gender: 'M',
            ci: 'testCI',
            carrier: 'KT',
            phoneNumber: '+8201088812173',
            createdAt: '2021-09-23T09:40:55.008Z',
            updatedAt: '2021-09-23T09:40:55.008Z'
        };
        JSON.parse = jest.fn(() => ({
            email : "testSellerEmail",
            name : "testSellerName"
        }));
        UserRepository.prototype.queryUser = jest.fn().mockImplementation(() => (expectResult));

        const result = await getUserInfo(event, null, null);
        expect(result).toHaveProperty("statusCode", 200);
        expect(result).toHaveProperty("body", expect.stringMatching('"success":true'));
        expect(UserRepository.prototype.queryUser).toHaveBeenCalledTimes(1);
    })
})