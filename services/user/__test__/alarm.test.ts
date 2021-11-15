import { APIGatewayProxyEvent } from "aws-lambda";
import { handler as makeAlarm } from "../handler/alarm/makeAlarm";
import { handler as getAlarm } from "../handler/alarm/getAlarm";
import { handler as readAlarm } from "../handler/alarm/readAlarm";
import { AlarmRepository } from "subpingrdb/dist/src/repository/Alarm";
import SubpingRDB from "subpingrdb";
import { mocked } from "ts-jest/utils";

let event: APIGatewayProxyEvent = {
    headers: {
        id : "ce7b86e3-68e3-4ec7-be8b-c519e1bc63d9"
    }
} as any;
mocked(SubpingRDB).prototype.getConnection("dev");

let mJsonParse = jest.fn();
JSON.parse = mJsonParse;

const alarmRepository = AlarmRepository.prototype;

describe('alarm', () => {
    test('makeAlarm', async () => {
        mJsonParse.mockImplementationOnce(() => ({
            title: "testTitle",
            type : "testType",
            content : "testContent",
        }));
        alarmRepository.createAlarm = jest.fn();

        const result = await makeAlarm(event, null, null);
        expect(result).toHaveProperty("statusCode", 200);
        expect(result).toHaveProperty("body", expect.stringMatching('"success":true'));
        expect(alarmRepository.createAlarm).toHaveBeenCalledTimes(1);
    })

    test('getAlarm', async () => {
        const expectResult = [
            {
                type: 'delivery',
                title: 'aa',
                content: 'bb',
                read: 0,
                createdAt: '2021-09-30T16:53:13.647Z',
                updatedAt: '2021-09-30T16:53:13.647Z',
                userId: 'ce7b86e3-68e3-4ec7-be8b-c519e1bc63d9',
                id: '3997e8fc-62fb-4276-86eb-dafa471f1a91'
            },
            {
                type: 'expiration',
                title: '이정진 전용',
                content: 'Expriration Message',
                read: 0,
                createdAt: '2021-09-23T18:40:58.771Z',
                updatedAt: '2021-09-23T18:40:58.771Z',
                userId: 'ce7b86e3-68e3-4ec7-be8b-c519e1bc63d9',
                id: '6b21c1c7-9548-4813-82cc-72b1d546baf1'
            },
            {
                type: 'payment',
                title: '이정진 전용',
                content: 'Payment Message',
                read: 0,
                createdAt: '2021-09-23T18:40:58.057Z',
                updatedAt: '2021-09-23T18:40:58.057Z',
                userId: 'ce7b86e3-68e3-4ec7-be8b-c519e1bc63d9',
                id: '2118a203-7eaa-4cdc-a261-67c9cfb5b229'
            }
        ];
        alarmRepository.queryAlarms = jest.fn().mockImplementation(() => (expectResult));

        const result = await getAlarm(event, null, null);
        expect(result).toHaveProperty("statusCode", 200);
        expect(result).toHaveProperty("body", expect.stringMatching('"success":true'));
        expect(alarmRepository.queryAlarms).toHaveBeenCalledTimes(1);
    })

    test('readAlarm', async () => {
        const expectResult = [
            {
                id: '051d4419-48f1-4a59-a6c2-8eeaae90ad05',
                type: 'info',
                title: '이정진 전용',
                content: 'Info Message',
                read: false,
                createdAt: '2021-09-23T09:40:57.321Z',
                updatedAt: '2021-09-23T09:40:57.321Z'
            },
            {
                id: '146c6a92-a032-43f6-8616-f7563292dde1',
                type: 'delivery',
                title: '이정진 전용',
                content: 'Delivery Message',
                read: false,
                createdAt: '2021-09-23T09:40:57.684Z',
                updatedAt: '2021-09-23T09:40:57.684Z'
            },
            {
                id: '2118a203-7eaa-4cdc-a261-67c9cfb5b229',
                type: 'payment',
                title: '이정진 전용',
                content: 'Payment Message',
                read: false,
                createdAt: '2021-09-23T09:40:58.057Z',
                updatedAt: '2021-09-23T09:40:58.057Z'
            }
        ];
        alarmRepository.queryUnreadAlarms = jest.fn().mockImplementation(() => (expectResult));
        alarmRepository.updateAlarmToRead = jest.fn();

        const result = await readAlarm(event, null, null);
        expect(result).toHaveProperty("statusCode", 200);
        expect(result).toHaveProperty("body", expect.stringMatching('"success":true'));
        expect(alarmRepository.queryUnreadAlarms).toHaveBeenCalledTimes(1);
        expect(alarmRepository.updateAlarmToRead).toHaveBeenCalledTimes(expectResult.length);
    })
})