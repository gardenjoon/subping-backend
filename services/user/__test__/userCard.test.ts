import { APIGatewayProxyEvent } from "aws-lambda";
import { handler as createUserCard } from "../handler/card/createUserCard";
import { handler as getUserCards } from "../handler/card/getUserCards";
import { handler as deleteUserCard } from "../handler/card/deleteUserCard";
import { UserCardRepository } from "subpingrdb/dist/src/repository/UserCard";
import SubpingRDB from "subpingrdb";
import { mocked } from "ts-jest/utils";

let event: APIGatewayProxyEvent = {
    headers: {
        id : "5c1547f2-1049-4d64-8a0a-3140931127e9"
    }
} as any;
mocked(SubpingRDB).prototype.getConnection("dev");

const mJsonParse = jest.fn();
JSON.parse = mJsonParse;

const userCardRepository = UserCardRepository.prototype;

describe('userCard', () => {
    test('createUserCard', async () => {
        mJsonParse.mockImplementationOnce(() => ({
            cardVendor: "test삼성카드",
            billingKey: "testBillingKey",
            method: "card",
            pg: "danal_tpay",
            cardName : "testCardName"
        }));
        userCardRepository.save = jest.fn();

        const result = await createUserCard(event, null, null);
        expect(result).toHaveProperty("statusCode", 200);
        expect(result).toHaveProperty("body", expect.stringMatching('"success":true'));
        expect(userCardRepository.save).toHaveBeenCalledTimes(1);
    })

    test('getUserCards', async () => {
        const expectResult = [
            {
                id: '2a5a14cd-53ed-41af-8514-66ed389a3944',
                userId: '5c1547f2-1049-4d64-8a0a-3140931127e9',
                cardName: '테스트',
                cardVendor: '삼성카드',
                method: 'card'
            },
            {
                id: '2b2dc6eb-f173-4c64-9dcb-a75e1fb6edf7',
                userId: '5c1547f2-1049-4d64-8a0a-3140931127e9',
                cardName: 'testt',
                cardVendor: '신한카드',
                method: 'card'
            },
            {
                id: '9c058575-b414-4480-a73d-f18e51ab20fe',
                userId: '5c1547f2-1049-4d64-8a0a-3140931127e9',
                cardName: 'test',
                cardVendor: 'KB국민',
                method: 'card'
            }
        ];
        userCardRepository.queryUserCards = jest.fn().mockImplementation(() => (expectResult));

        const result = await getUserCards(event, null, null);
        expect(result).toHaveProperty("statusCode", 200);
        expect(result).toHaveProperty("body", expect.stringMatching('"success":true'));
        expect(userCardRepository.queryUserCards).toHaveBeenCalledTimes(1);
    })

    test('deleteUserCard', async () => {
        const expectResult = {
            id: '2a5a14cd-53ed-41af-8514-66ed389a3944',
            cardVendor: '삼성카드',
            cardName: '테스트',
            billingKey: 'jsw9808@gmail.com-0dc94676-540d-401f-a3dd-6e95745d7219',
            pg: 'danal_tpay',
            method: 'card',
            expiredAt: null,
            createdAt: '2021-11-12T12:18:15.030Z',
            updatedAt: '2021-11-12T12:18:15.030Z',
            userId: '5c1547f2-1049-4d64-8a0a-3140931127e9'
        };
        mJsonParse.mockImplementationOnce(() => ({
            cardId : "2a5a14cd-53ed-41af-8514-66ed389a3944"
        }));

        userCardRepository.findOne = jest.fn().mockImplementation(() => (expectResult));
        userCardRepository.delete = jest.fn();

        const result = await deleteUserCard(event, null, null);
        expect(result).toHaveProperty("statusCode", 200);
        expect(result).toHaveProperty("body", expect.stringMatching('"success":true'));
        expect(userCardRepository.findOne).toHaveBeenCalledTimes(1);
        expect(userCardRepository.delete).toHaveBeenCalledTimes(1);
    })
})