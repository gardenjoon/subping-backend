import { APIGatewayProxyEvent } from "aws-lambda";
import { handler as makeSeller } from "../handler/seller/makeSeller";
import { SellerRepository } from "subpingrdb/dist/src/repository/Seller";
import SubpingRDB from "subpingrdb";
import { mocked } from "ts-jest/utils";

let event: APIGatewayProxyEvent = {
    headers: {
        id : "18864f6c-44c7-4dc9-9bce-e81d1b173aa0"
    }
} as any;

mocked(SubpingRDB).prototype.getConnection("dev");

describe('seller', () => {
    test('makeSeller', async () => {
        JSON.parse = jest.fn(() => ({
            email : "testSellerEmail",
            name : "testSellerName"
        }));
        SellerRepository.prototype.createSeller = jest.fn();

        const result = await makeSeller(event, null, null);
        expect(result).toHaveProperty("statusCode", 200);
        expect(result).toHaveProperty("body", expect.stringMatching('"success":true,"message":"MakeSellerSuccess'));
        expect(SellerRepository.prototype.createSeller).toHaveBeenCalledTimes(1);
    })
})