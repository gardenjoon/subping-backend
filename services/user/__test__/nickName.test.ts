import { APIGatewayProxyEvent } from "aws-lambda";
import { handler as duplicateNickName } from "../handler/nickname/duplicateNickName";
import { handler as updateNickName } from "../handler/nickname/updateNickName";
import { UserRepository } from "subpingrdb/dist/src/repository/User";
import SubpingRDB from "subpingrdb";
import { mocked } from "ts-jest/utils";

let event: APIGatewayProxyEvent = {
    headers: {
        id : "5c1547f2-1049-4d64-8a0a-3140931127e9"
    }
} as any;
mocked(SubpingRDB).prototype.getConnection("dev");

let mJsonParse = jest.fn();
JSON.parse = mJsonParse;

const userRepsitory = UserRepository.prototype;

describe('nickName', () => {
    test('duplicateNickName', async () => {
        let userExist = true;
        const expectResult = {
            id: '0b3ad8f8-0eea-486c-893a-4da6d16f3aa2',
            email: 'dlwjdwls6505@gmail.com',
            name: '정승우',
            nickName: '잊그디그',
            userProfileImageUrl: null,
            birthday: '1998-08-03',
            gender: 'M',
            ci: 'testCI',
            carrier: 'SKT',
            phoneNumber: '01088812173',
            createdAt: '2021-09-30T12:39:46.335Z',
            updatedAt: '2021-09-30T12:40:08.000Z'
        };
        
        let mQueryUserByNickName = jest.fn();
        userRepsitory.queryUserByNickName = mQueryUserByNickName;

        if(userExist) {
            mJsonParse.mockImplementationOnce(() => ({nickName: "잊그디그"}));
            mQueryUserByNickName.mockImplementationOnce(() => (expectResult));

            const resultExist = await duplicateNickName(event, null, null);
            expect(resultExist).toHaveProperty("statusCode", 200);
            expect(resultExist).toHaveProperty("body", expect.stringMatching('"success":true,"message":true'));
            expect(userRepsitory.queryUserByNickName).toHaveBeenCalledWith("잊그디그");

            userExist = false;
        }

        if (!userExist) {
            mJsonParse.mockImplementationOnce(() => ({nickName: "testNickName"}));
            mQueryUserByNickName.mockImplementationOnce(() => (null));

            const resultNoneExist = await duplicateNickName(event, null, null);
            expect(resultNoneExist).toHaveProperty("statusCode", 200);
            expect(resultNoneExist).toHaveProperty("body", expect.stringMatching('"success":true,"message":false'));
            expect(userRepsitory.queryUserByNickName).toHaveBeenCalledWith("testNickName");
        }
    })

    test('updateNickName', async () => {
        let nickNameValid = false;
        userRepsitory.updateUserNickName = jest.fn();

        if (!nickNameValid) {
            mJsonParse.mockImplementationOnce(() => ({nickName: "testNick!!"}))
            const result = await updateNickName(event, null, null);
            expect(result).toHaveProperty("statusCode", 200);
            expect(result).toHaveProperty("body", expect.stringMatching('"success":false,"message":"NickNameInvalidException"'));
            expect(userRepsitory.updateUserNickName).toHaveBeenCalledTimes(0);

            nickNameValid = true;
        }

        if (nickNameValid) {
            mJsonParse.mockImplementationOnce(() => ({nickName : "testNick1234"}));
            const result = await updateNickName(event, null, null);
            expect(result).toHaveProperty("statusCode", 200);
            expect(result).toHaveProperty("body", expect.stringMatching('"success":true,"message":"UpdateNickNameSuccess"'));
            expect(userRepsitory.updateUserNickName).toHaveBeenCalledWith(event.headers.id, "testNick1234");
        }
    })
})