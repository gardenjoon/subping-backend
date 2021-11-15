import { APIGatewayProxyEvent } from "aws-lambda";
import { ServiceRepository } from "subpingrdb/dist/src/repository/Service";
import { ServiceTagRepository } from "subpingrdb/dist/src/repository/ServiceTags";
import { handler as autoComplete } from "../handler/search/autoComplete";
import { handler as search } from "../handler/search/search";
import SubpingRDB from "subpingrdb";
import { mocked } from "ts-jest/utils";

let event: APIGatewayProxyEvent = {} as any;
mocked(SubpingRDB).prototype.getConnection("dev");

const mJsonParse = jest.fn();
JSON.parse = mJsonParse;

const serviceRepository = ServiceRepository.prototype;
const serviceTagRepository = ServiceTagRepository.prototype;

describe("search", () => {
    test("autoComplete", async () => {
        const expectServiceResult = [
            {
                name: "넷플릭스",
                id: "35f6a231-4832-49dc-be76-c8241ebb8135",
                serviceLogoUrl:
                    "https://subping-assets.s3.ap-northeast-2.amazonaws.com/serviceLogo/watcha.png",
            },
            {
                name: "하비인더박스",
                id: "62f63d9f-ad0a-4287-bb6a-e1593537330d",
                serviceLogoUrl:
                    "https://subping-assets.s3.ap-northeast-2.amazonaws.com/serviceLogo/watcha.png",
            },
        ];
        const expectTagResult = [{ tag: "뉴스" }];
        mJsonParse.mockImplementation(() => ({
            requestWord: "미",
        }));

        serviceRepository.searchServices = jest.fn().mockResolvedValue(expectServiceResult);
        serviceTagRepository.searchTags = jest.fn().mockResolvedValue(expectTagResult);

        const result = await autoComplete(event, null, null);
        expect(result).toHaveProperty("statusCode", 200);
        expect(result).toHaveProperty("body",expect.stringMatching('"success":true'));
        expect(serviceRepository.searchServices).toHaveBeenCalledTimes(1);
        expect(serviceTagRepository.searchTags).toHaveBeenCalledTimes(1);
    });

    test("search", async () => {
        const expectResult = [
            {
                name: "하비인더박스",
                type: "delivery",
                serviceLogoUrl:
                "https://subping-assets.s3.ap-northeast-2.amazonaws.com/serviceLogo/watcha.png",
                serviceExplaneUrl: null,
                summary:
                "집순이들 강추! 신박하고 재밌는 쫌쫌따리 취미 구독 서비스",
                customizable: 1,
                createdAt: "2021-10-06T09:52:47.014Z",
                updatedAt: "2021-10-06T09:52:47.014Z",
                sellerId: "28864f6c-44c7-4dc9-9bce-e81d1b173aa0",
                id: "62f63d9f-ad0a-4287-bb6a-e1593537330d",
                tag: "취미",
            },
        ];
        mJsonParse.mockImplementation(() => ({
            requestWord: "취미",
        }));

        serviceRepository.searchServices = jest.fn().mockResolvedValue(expectResult);

        const result = await search(event, null, null);
        expect(result).toHaveProperty("statusCode", 200);
        expect(result).toHaveProperty("body", expect.stringMatching('"success":true'));
        expect(serviceRepository.searchServices).toHaveBeenCalledTimes(1);
    });
});