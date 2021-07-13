import * as dynamoDBLib from "../libs/dynamodb-lib";
import { TCombinedAllReadIndex } from "../types/types";

class DefaultController {
    tableName: string;

    constructor(tableName: string) {
        this.tableName = tableName
    }

    generateReadParamsDefault(PKSKMapper: Record<string, { PK: string, SK: string }>, readIndex: TCombinedAllReadIndex, PK: string, SK?: string, filter?: Record<string, string>, SKBeginsWith?: boolean) {
        const PKSKKey = PKSKMapper[readIndex];
        const ExpressionAttributeValues: any = {}
        let KeyConditionExpression: string = "";
        let FilterExpression: string = "";
        KeyConditionExpression = `${PKSKKey.PK} = :QueryPK`;
        ExpressionAttributeValues[":QueryPK"] = PK;

        const params: Record<string, any> = {
            TableName: this.tableName,
            ScanIndexForward: false,
        }

        if (SK) {
            ExpressionAttributeValues[":QuerySK"] = SK;

            if (SKBeginsWith) {
                KeyConditionExpression += ` and begins_with(${PKSKKey.SK}, :QuerySK)`;
            }

            else {
                KeyConditionExpression += ` and ${PKSKKey.SK} = :QuerySK`;
            }
        }

        if (filter) {
            const filterKeys: string[] = Object.keys(filter);
            filterKeys.map(key => {
                // filter에 있는 property가 Index에서 PK 또는 SK로 사용될 떄
                if (key === PKSKKey.PK || key === PKSKKey.SK) {
                    throw new Error("필터에는 인덱스의 키 값을 사용할 수 없습니다.");
                }

                if (FilterExpression) {
                    FilterExpression += ` and ${key} = :${key}`
                }

                else {
                    FilterExpression += `${key} = :${key}`
                }

                ExpressionAttributeValues[`:${key}`] = filter[key];
            })

            params["FilterExpression"] = FilterExpression
        }

        params["KeyConditionExpression"] = KeyConditionExpression;
        params["ExpressionAttributeValues"] = ExpressionAttributeValues;

        if (readIndex !== "PK-SK-Index" && readIndex !== "uniqueId-Index") {
            params["IndexName"] = readIndex
        }

        return params
    }

    async create<T>(property: T) {
        const currentDate = new Date().toISOString();

        const params = {
            TableName: this.tableName,
            Item: {
                ...property,
                createdAt: currentDate,
                updatedAt: currentDate
            }
        };

        await dynamoDBLib.call("put", params);
    }

    async read(readIndex: TCombinedAllReadIndex, PK: string, SK?: string, SKBeginsWith: boolean = false): Promise<any> {
        throw new Error("read 함수가 정의되지 않았습니다.")
    }

    async readWithFilter(readIndex: TCombinedAllReadIndex, PK: string, SK?: string, filter?: Record<string, any>, SKBeginsWith: boolean = false) {
        throw new Error("readWithFilter 함수가 정의되지 않았습니다.")
    }

    async delete(PK: string, SK: string) {
        throw new Error("delete 함수가 정의되지 않았습니다.")
    }

    async update(PK: string, SK: string, updated: Record<string, any>) {
        throw new Error("update 함수가 정의되지 않았습니다.")
    }

    async transactionCreate(property: any[]) {
        const createParam: any = [];

        property.forEach(element => {
            const currentDate = new Date().toISOString();

            const params = {
                TableName: this.tableName,
                Item: {
                    ...element,
                    createdAt: currentDate,
                    updatedAt: currentDate
                }
            };

            createParam.push(
                {
                    "Put": params
                }
            )
        })

        await dynamoDBLib.call("transactWrite", createParam, (err, data) => {
            if(err) {
                console.log("[SubpingDDB] transacWriteError : ", err);
            }
        });
    }
}

export default DefaultController