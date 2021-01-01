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
        console.log(params)
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
}

export default SubpingTableController