import { APIGatewayProxyEvent } from "aws-lambda";
import { handler as getService } from "../handler/service/getService";
import { handler as getServices } from "../handler/service/getServices";
// import { handler as makeService } from "../handler/service/makeService";
import { ServiceRepository } from "subpingrdb/dist/src/repository/Service";
import SubpingRDB from "subpingrdb";
import { mocked } from "ts-jest/utils";

let event: APIGatewayProxyEvent = {
    headers: {
        id : "0b3ad8f8-0eea-486c-893a-4da6d16f3aa2"
    }
} as any;
mocked(SubpingRDB).prototype.getConnection("dev");

const mJsonParse = jest.fn();
JSON.parse = mJsonParse;

const serviceRepository = ServiceRepository.prototype;

describe("service", () => {
    test("getService", async () => {
        const expectResult = {
            name: '넷플릭스',
            type: 'online',
            serviceLogoUrl: 'https://subping-assets.s3.ap-northeast-2.amazonaws.com/serviceLogo/watcha.png',
            serviceExplaneUrl: null,
            summary: '전세계 모든 미디어를 한곳에서!',
            customizable: 0,
            createdAt: '2021-09-23T09:40:41.608Z',
            updatedAt: '2021-10-01T10:32:13.000Z',
            sellerId: '18864f6c-44c7-4dc9-9bce-e81d1b173aa0',
            id: '35f6a231-4832-49dc-be76-c8241ebb8135',
            category: [ '미디어' ],
            tag: [ '드라마', '영화' ],
            period: [ '1M', '1W', '2W', '3W' ],
            like: 0
        };
        mJsonParse.mockImplementation(() => ({
            serviceId : "35f6a231-4832-49dc-be76-c8241ebb8135"
        }));
        serviceRepository.queryServices = jest.fn().mockImplementation(() => (expectResult));

        const result = await getService(event, null, null);
        expect(result).toHaveProperty("statusCode", 200);
        expect(result).toHaveProperty("body", expect.stringMatching('"success":true'));
        expect(serviceRepository.queryServices).toHaveBeenCalledTimes(1);
    })

    test("getServices", async () => {
        const expectResult = [
            {
              name: '넷플릭스',
              type: 'online',
              serviceLogoUrl: 'https://subping-assets.s3.ap-northeast-2.amazonaws.com/serviceLogo/watcha.png',
              serviceExplaneUrl: null,
              summary: '전세계 모든 미디어를 한곳에서!',
              customizable: 0,
              createdAt: '2021-09-23T09:40:41.608Z',
              updatedAt: '2021-10-01T10:32:13.000Z',
              sellerId: '18864f6c-44c7-4dc9-9bce-e81d1b173aa0',
              id: '35f6a231-4832-49dc-be76-c8241ebb8135',
              category: [ '미디어' ],
              like: 0
            },
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
              category: [ '미디어' ],
              like: 0
            }
        ];
        mJsonParse.mockImplementation(() => ({
            category : "미디어"
        }));
        serviceRepository.queryServices = jest.fn().mockImplementation(() => (expectResult));

        const result = await getServices(event, null, null);
        expect(result).toHaveProperty("statusCode", 200);
        expect(result).toHaveProperty("body", expect.stringMatching('"success":true'));
        expect(serviceRepository.queryServices).toHaveBeenCalledTimes(1);
    })
})