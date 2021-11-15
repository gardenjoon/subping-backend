import { APIGatewayProxyEvent } from "aws-lambda";
import { CategoryRepository } from "subpingrdb/dist/src/repository/Category";
import { handler as getCategories } from "../handler/category/getCategories";
import { handler as makeCategory } from "../handler/category/makeCategory";
import SubpingRDB from "subpingrdb";
import { mocked } from "ts-jest/utils";

let event: APIGatewayProxyEvent = {} as any;
mocked(SubpingRDB).prototype.getConnection("dev")

const categoryRepository = CategoryRepository.prototype;

describe("category", () => {
    test("getCategories", async () => {
        const expectResult = {
            "name":"미디어",
            "summary":"영화,드라마 등에 관한 카테고리입니다",
            "categoryLogoUrl":null,
            "createdAt":"2021-09-23T00:17:12.982Z",
            "updatedAt":"2021-09-23T00:17:12.982Z"
        };
        categoryRepository.queryAllCategories = jest.fn().mockResolvedValue(expectResult);
        
        const result = await getCategories(event, null, null);
        expect(result).toHaveProperty("statusCode", 200);
        expect(result).toHaveProperty("body", expect.stringMatching('"success":true'));
        expect(categoryRepository.queryAllCategories).toHaveBeenCalledTimes(1);
    })

    test("makeCategory", async () => {
        JSON.parse = jest.fn(() => ({
            name : "testCategoryName", 
            summary : "testCategorySummary", 
            categoryLogoUrl : "testCategoryLogoUrl" 
        }));
        categoryRepository.createCategory = jest.fn().mockResolvedValue(true);

        const result = await makeCategory(event, null, null);
        expect(result).toHaveProperty("statusCode", 200);
        expect(result).toHaveProperty("body", expect.stringMatching('"success":true'));
        expect(categoryRepository.createCategory).toHaveBeenCalledTimes(1);
    })
})
