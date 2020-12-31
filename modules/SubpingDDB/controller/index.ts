import * as dynamoDBLib from "../libs/dynamodb-lib";
import { TReadIndex } from "../types/types";

class DefaultController {
    private tableName: string;

    constructor(tableName: string) {
        this.tableName = tableName
    }

    private PKSKMapper: Record<TReadIndex, { PK: string, SK: string }> = {
        "PK-SK-Index": {
            "PK": "PK",
            "SK": "SK"
        },
        "PK-createdAt-Index": {
            PK: "PK",
            SK: "createdAt"
        },
        "PK-updatedAt-Index": {
            PK: "PK",
            SK: "updatedAt"
        },
        "SK-PK-Index": {
            PK: "SK",
            SK: "PK"
        },
        "model-PK-Index": {
            PK: "model",
            SK: "PK"
        }
    }

    private generateReadExpression(readIndex: TReadIndex, PK: string, SK?: string, filter?: Record<string, string>, SKBeginsWith?: boolean) {
        const PKSKKey = this.PKSKMapper[readIndex];
        const ExpressionAttributeValues: any = {}
        let KeyConditionExpression: string = "";
        let FilterExpression: string = "";
        KeyConditionExpression = `${PKSKKey.PK} = :QueryPK`;
        ExpressionAttributeValues[":QueryPK"] = PK;

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
        }

        return {
            KeyConditionExpression: KeyConditionExpression,
            ExpressionAttributeValues: ExpressionAttributeValues,
            FilterExpression: FilterExpression
        }
    }

    async create<T>(property: T) {
        const params = {
            TableName: this.tableName,
            Item: property
        };

        console.log(params)

        await dynamoDBLib.call("put", params);
    }

    async read(readIndex: TReadIndex, PK: string, SK?: string): Promise<any> {
        const expression = this.generateReadExpression(readIndex, PK, SK, {}, false);

        const params: Record<string, any> = {
            TableName: this.tableName,
            KeyConditionExpression: expression.KeyConditionExpression,
            ExpressionAttributeValues: expression.ExpressionAttributeValues,
            ScanIndexForward: false,
        };

        if (readIndex !== "PK-SK-Index") {
            params["IndexName"] = readIndex
        }

        const result = await dynamoDBLib.call("query", params);
        return result;
    }

    async readSKBeginsWith(readIndex: TReadIndex, PK: string, SK: string): Promise<any> {
        const expression = this.generateReadExpression(readIndex, PK, SK, {}, true);

        const params: Record<string, any> = {
            TableName: this.tableName,
            KeyConditionExpression: expression.KeyConditionExpression,
            ExpressionAttributeValues: expression.ExpressionAttributeValues,
            ScanIndexForward: false,
        };

        if (readIndex !== "PK-SK-Index") {
            params["IndexName"] = readIndex
        }

        const result = await dynamoDBLib.call("query", params);
        return result;
    }

    async readWithFilter(readIndex: TReadIndex, PK: string, SK?: string, filter?: Record<string, string>, SKBeginsWith: boolean = false) {
        const expression = this.generateReadExpression(readIndex, PK, SK, filter, SKBeginsWith);

        const params: Record<string, any> = {
            TableName: this.tableName,
            KeyConditionExpression: expression.KeyConditionExpression,
            FilterExpression: expression.FilterExpression,
            ExpressionAttributeValues: expression.ExpressionAttributeValues,
            ScanIndexForward: false,
        };

        if (readIndex !== "PK-SK-Index") {
            params["IndexName"] = readIndex;
        }

        console.log(params)

        const result = await dynamoDBLib.call("query", params);
        console.log(result)
        return result;
    }

    delete(PK: string, SK: string) {

    }

    update<T>(PK: string, SK: string, updated: T) {

    }
}

export default DefaultController