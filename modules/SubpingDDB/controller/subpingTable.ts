import * as dynamoDBLib from "../libs/dynamodb-lib";
import { TSubpingTableReadIndex, TCombinedAllReadIndex } from "../types/types";
import DefaultController from "./default";

class SubpingTableController extends DefaultController {
    constructor(tableName: string) {
        super(tableName)
    }

    private PKSKMapper: Record<TSubpingTableReadIndex, { PK: string, SK: string }> = {
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

    private generateReadParams(readIndex: TCombinedAllReadIndex, PK: string, SK?: string, filter?: Record<string, string>, SKBeginsWith?: boolean) {
        const params = super.generateReadParamsDefault(this.PKSKMapper, readIndex, PK, SK, filter, SKBeginsWith);
        return params
    }

    private generateUpdateParams(PK: string, SK: string, updated: Record<string, string>) {
        const currentDate = new Date().toISOString();

        let updateExpression: string = "SET updatedAt = :updatedAt,";
        const expressionAttributeValues: any = {};

        const updatedKeys = Object.keys(updated);
        expressionAttributeValues[":updatedAt"] = currentDate;

        updatedKeys.forEach((key) => {
            updateExpression += ` ${key} = :${key},`;
            expressionAttributeValues[`:${key}`] = updated[key];
        });

        updateExpression = updateExpression.substr(0, updateExpression.length - 1);

        const params = {
            TableName: this.tableName,
            Key: {
                PK: PK,
                SK: SK
            },
            UpdateExpression: updateExpression,
            ExpressionAttributeValues: expressionAttributeValues,
            ReturnValues: "ALL_NEW"
        }

        return params
    }

    async read(readIndex: TCombinedAllReadIndex, PK: string, SK?: string, SKBeginsWith: boolean = false): Promise<any> {
        if (readIndex === "uniqueId-Index") {
            throw new Error("해당 Table에서 사용할 수 없는 Index입니다.")
        }

        const params: Record<string, any> = this.generateReadParams(readIndex, PK, SK, undefined, SKBeginsWith);

        const result = await dynamoDBLib.call("query", params);
        return result;
    }

    async readWithFilter(readIndex: TCombinedAllReadIndex, PK: string, SK?: string, filter?: Record<string, string>, SKBeginsWith: boolean = false): Promise<any> {
        if (readIndex === "uniqueId-Index") {
            throw new Error("해당 Table에서 사용할 수 없는 Index입니다.")
        }

        const params = this.generateReadParams(readIndex, PK, SK, filter, SKBeginsWith);

        const result = await dynamoDBLib.call("query", params);
        return result;
    }

    async delete(PK: string, SK: string) {
        const params = {
            TableName: super.tableName,
            Key: {
                PK: PK,
                SK: SK,
            },
        }

        await dynamoDBLib.call("delete", params);
    }

    async update(PK: string, SK: string, updated: Record<string, any>): Promise<void> {
        const updatedKeys: string[] = Object.keys(updated);

        updatedKeys.map(key => {
            if (["PK", "SK", "model", "createdAt", "updatedAt"].includes(key)) {
                throw new Error("설정한 property는 수정할 수 없습니다.");
            }
        });

        const params = this.generateUpdateParams(PK, SK, updated);

        await dynamoDBLib.call("update", params);
    }
}

export default SubpingTableController