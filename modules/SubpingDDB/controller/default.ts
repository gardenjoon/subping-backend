import * as dynamoDBLib from "../libs/dynamodb-lib";
import { TReadIndex } from "../types/types";

class DefaultController<T> {
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

    private generateUpdateExpression(updated: T) {
        let updateExpression: string = "SET";
        const expressionAttributeValues: any = {};

        const updatedKeys = Object.keys(updated);
        updatedKeys.forEach((value, key) => {
            updateExpression += ` ${key} = :${key}, `;
            expressionAttributeValues[`:${key}`] = value;
        });

        return {
            UpdateExpression: updateExpression,
            ExpressionAttributeValues: expressionAttributeValues
        }
    }

    private generateReadExpression(readIndex: TReadIndex, PK: string, SK?: string, beginsWith?: boolean) {
        const PKSKKey = this.PKSKMapper[readIndex];
        const ExpressionAttributeValues: any = {}
        let KeyConditionExpression: string

        KeyConditionExpression = `${PKSKKey.PK} = :PK`;
        ExpressionAttributeValues[":PK"] = PK

        if (SK) {
            ExpressionAttributeValues[":SK"] = SK

            if (beginsWith) {
                KeyConditionExpression += ` and begins_with(${PKSKKey.SK}, :SK)`
            }

            else {
                KeyConditionExpression += ` and ${PKSKKey.SK} = :SK`
            }
        }

        return {
            KeyConditionExpression: KeyConditionExpression,
            ExpressionAttributeValues: ExpressionAttributeValues
        }
    }

    async create(tableName: string, property: any) {
        const params = {
            TableName: tableName,
            Item: property
        };

        await dynamoDBLib.call("put", params);
    }

    async read(tableName: string, readIndex: TReadIndex, PK: string, SK?: string): Promise<any> {
        const expression = this.generateReadExpression(readIndex, PK, SK, false);

        const params: Record<string, any> = {
            TableName: tableName,
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

    async readSKBeginsWith(tableName: string, readIndex: TReadIndex, PK: string, SK: string): Promise<any> {
        const expression = this.generateReadExpression(readIndex, PK, SK, true);

        const params: Record<string, any> = {
            TableName: tableName,
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

    async readWithFilter(tableName: string, readIndex: TReadIndex, PK: string, SK?: string) {
        // 구현 예정
    }

    delete(PK: string, SK: string) {

    }

    update(PK: string, SK: string, updated: T) {

    }
}

export default DefaultController