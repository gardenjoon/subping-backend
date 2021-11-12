import { APIGatewayProxyEvent } from "aws-lambda";
import { CategoryRepository } from "subpingrdb/dist/src/repository/Category";
import { handler as getCategories } from "../handler/category/getCategories";
import { handler as makeCategory } from "../handler/category/makeCategory";
import { mocked } from "ts-jest/utils";
import SubpingRDB from "subpingrdb";

let event: APIGatewayProxyEvent = {} as any;
mocked(SubpingRDB).prototype.getConnection("dev");

describe("category", () => {
    test("getCategories", async () => {
        const expectResult = {
            "name":"미디어",
            "summary":"영화,드라마 등에 관한 카테고리입니다",
            "categoryLogoUrl":null,
            "createdAt":"2021-09-23T00:17:12.982Z",
            "updatedAt":"2021-09-23T00:17:12.982Z"
        }
        
        const mockQueryAllCategories = jest.fn().mockResolvedValue(expectResult);

        CategoryRepository.prototype.queryAllCategories = mockQueryAllCategories;
        
        const result = await getCategories(event, null, null);
        expect(result).toHaveProperty("statusCode", 200);
        expect(result).toHaveProperty("body", expect.stringMatching('"success":true'));
        expect(CategoryRepository.prototype.queryAllCategories).toHaveBeenCalledTimes(1);
    })

    test("makeCategory", async () => {
        const jsonEvent = {
            name : "testCategoryName", 
            summary : "testCategorySummary", 
            categoryLogoUrl : "testCategoryLogoUrl" 
        };
        JSON.parse = jest.fn(() => (jsonEvent));
        
        const mockCreateCategory = jest.fn().mockResolvedValue(true);

        CategoryRepository.prototype.createCategory = mockCreateCategory;

        const result = await makeCategory(event, null, null);
        expect(result).toHaveProperty("statusCode", 200);
        expect(result).toHaveProperty("body", expect.stringMatching('"success":true'));
        expect(CategoryRepository.prototype.createCategory).toHaveBeenCalledTimes(1);
    })
})
