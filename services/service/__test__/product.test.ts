import { APIGatewayProxyEvent } from "aws-lambda";
import { ProductRepository } from "subpingrdb/dist/src/repository/Product";
import { handler as getproducts } from "../handler/product/getProducts";
import { handler as makeProduct } from "../handler/product/makeProduct";
import SubpingRDB from "subpingrdb";
import {mocked} from "ts-jest/utils";

let event: APIGatewayProxyEvent = {} as any;

mocked(SubpingRDB).prototype.getConnection("dev");

const mJsonParse = jest.fn();
JSON.parse = mJsonParse;

const productRepository = ProductRepository.prototype;

describe("product", () => {
    test("getproducts", async () => {
        const expectResult = {
            price: 14500,
            name: 'Premium',
            summary: '넷플릭스 프리미엄 요금제 입니다.',
            productLogoUrl: 'https://subping-assets.s3.ap-northeast-2.amazonaws.com/serviceLogo/watcha.png',
            available: 1,
            createdAt: '2021-09-23T09:40:52.216Z',
            updatedAt: '2021-09-23T09:40:52.216Z',
            serviceId: '35f6a231-4832-49dc-be76-c8241ebb8135',
            id: '28864f6c-44c7-4dc9-9bce-e81d1b173aa9'
        };
        mJsonParse.mockImplementationOnce(() => ({
            service : "35f6a231-4832-49dc-be76-c8241ebb8135"
        }));
        productRepository.queryProducts = jest.fn().mockResolvedValue(expectResult);
        
        const result = await getproducts(event, null, null);
        expect(result).toHaveProperty("statusCode", 200);
        expect(result).toHaveProperty("body", expect.stringMatching('"success":true'));
        expect(productRepository.queryProducts).toHaveBeenCalledTimes(1);
    })

    test("makeProduct", async () => {
        mJsonParse.mockImplementation(() => ({
            serviceId: "35f6a231-4832-49dc-be76-c8241ebb8135",
            name: "testProductName",
            price: 999999,
            summary: "testProductSummary",
            productLogoUrl: null,
            available: true
        }));
        productRepository.createProduct = jest.fn()

        const result = await makeProduct(event, null, null);
        expect(result).toHaveProperty("statusCode", 200);
        expect(result).toHaveProperty("body", expect.stringMatching('"success":true'));
        expect(productRepository.createProduct).toHaveBeenCalledTimes(1);
    })
})