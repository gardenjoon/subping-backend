import { APIGatewayProxyEvent } from "aws-lambda";
import { handler as toggleUserLike } from "../handler/like/toggleUserLike";
import { handler as getUserLikeServices } from "../handler/like/getUserLikeServices";
import { UserLikeRepository } from "subpingrdb/dist/src/repository/UserLike";
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

const userLikeRepository = UserLikeRepository.prototype;

describe('like', () => {
    test('toggleUserLike', async () => {
        let toggle = true;
        let existUserLike = false;

        const mQueryUserLike = jest.fn();
        userLikeRepository.queryUserLike = mQueryUserLike;
        userLikeRepository.createUserLike = jest.fn();
        userLikeRepository.deleteUserLike = jest.fn();

        if (toggle && !existUserLike) {
            mJsonParse.mockImplementationOnce(() => ({
                serviceId: "4dd6a155-be2e-4ca3-b3b0-6e044d5766dd",
                toggle: toggle,
            }));
            mQueryUserLike.mockImplementationOnce(() => (undefined));

            const result = await toggleUserLike(event, null, null);
            expect(result).toHaveProperty("statusCode", 200);
            expect(result).toHaveProperty("body", expect.stringMatching('"success":true,"message":true'));
            expect(userLikeRepository.queryUserLike).toHaveBeenCalledTimes(1);
            expect(userLikeRepository.createUserLike).toHaveBeenCalledTimes(1);
            expect(userLikeRepository.deleteUserLike).toHaveBeenCalledTimes(0);

            toggle = false;
            existUserLike = true;
        }
        
        if (!toggle && existUserLike) {
            const expectResult = {
                createdAt: '2021-09-30T06:35:03.371Z',
                updatedAt: '2021-09-30T06:35:03.371Z'
            };

            mJsonParse.mockImplementationOnce(() => ({
                serviceId: "4dd6a155-be2e-4ca3-b3b0-6e044d5766dd",
                toggle: toggle,
            }));
            mQueryUserLike.mockImplementationOnce(() => (expectResult));

            const result = await toggleUserLike(event, null, null);
            expect(result).toHaveProperty("statusCode", 200);
            expect(result).toHaveProperty("body", expect.stringMatching('"success":true,"message":false'));
            expect(userLikeRepository.queryUserLike).toHaveBeenCalledTimes(2);
            expect(userLikeRepository.createUserLike).toHaveBeenCalledTimes(1);
            expect(userLikeRepository.deleteUserLike).toHaveBeenCalledTimes(1);

            toggle = true;
        }

        if (toggle && existUserLike) {
            const expectResult = {
                createdAt: '2021-09-30T06:35:03.371Z',
                updatedAt: '2021-09-30T06:35:03.371Z'
            };

            mJsonParse.mockImplementationOnce(() => ({
                serviceId: "4dd6a155-be2e-4ca3-b3b0-6e044d5766dd",
                toggle: toggle,
            }));
            mQueryUserLike.mockImplementationOnce(() => (expectResult));

            const result = await toggleUserLike(event, null, null);
            expect(result).toHaveProperty("statusCode", 200);
            expect(result).toHaveProperty("body", expect.stringMatching('"success":true,"message":true'));
            expect(userLikeRepository.queryUserLike).toHaveBeenCalledTimes(3);
            expect(userLikeRepository.createUserLike).toHaveBeenCalledTimes(1);
            expect(userLikeRepository.deleteUserLike).toHaveBeenCalledTimes(1);

            toggle = false;
            existUserLike = false;
        }

        if (!toggle && !existUserLike) {
            mJsonParse.mockImplementationOnce(() => ({
                serviceId: "4dd6a155-be2e-4ca3-b3b0-6e044d5766dd",
                toggle: toggle,
            }));
            mQueryUserLike.mockImplementation(() => (null));

            const result = await toggleUserLike(event, null, null);
            expect(result).toHaveProperty("statusCode", 200);
            expect(result).toHaveProperty("body", expect.stringMatching('"success":true,"message":false'));
            expect(userLikeRepository.queryUserLike).toHaveBeenCalledTimes(4);
            expect(userLikeRepository.createUserLike).toHaveBeenCalledTimes(1);
            expect(userLikeRepository.deleteUserLike).toHaveBeenCalledTimes(1);
        }
    })

    test('getUserLikeServices', async () => {
        const expectResult = [
            {
                name: '왓챠',
                type: 'online',
                serviceLogoUrl: 'https://subping-assets.s3.ap-northeast-2.amazonaws.com/serviceLogo/watcha.png',
                serviceExplaneUrl: null,
                summary: '국내외 영화, 드라마를 한곳에서',
                customizable: 0,
                createdAt: '2021-09-23T09:40:43.118Z',
                updatedAt: '2021-10-01T10:20:03.719Z',
                sellerId: '18864f6c-44c7-4dc9-9bce-e81d1b173aa0',
                id: '4dd6a155-be2e-4ca3-b3b0-6e044d5766dd',
                like: 1,
                tag: [ '드라마', '영화' ]
            },
            {
                name: '술담화',
                type: 'delivery',
                serviceLogoUrl: 'https://subping-assets.s3.ap-northeast-2.amazonaws.com/serviceLogo/watcha.png',
                serviceExplaneUrl: null,
                summary: '매달 다른 술을 배송해드릴게요 😀',
                customizable: 0,
                createdAt: '2021-09-23T09:40:47.051Z',
                updatedAt: '2021-09-23T09:40:47.051Z',
                sellerId: '18864f6c-44c7-4dc9-9bce-e81d1b173aa0',
                id: 'bb1f2016-7945-44cc-a6b1-0f0ad152cdb2',
                like: 1,
                tag: [ '전통주', '주류' ]
            }
        ];

        userLikeRepository.queryUserLikes = jest.fn().mockImplementation(() => (expectResult));

        const result = await getUserLikeServices(event, null, null);
        expect(result).toHaveProperty("statusCode", 200);
        expect(result).toHaveProperty("body", expect.stringMatching('"success":true'));
        expect(userLikeRepository.queryUserLikes).toHaveBeenCalledTimes(1);
    })
})