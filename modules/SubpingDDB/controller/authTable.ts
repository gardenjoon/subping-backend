import * as dynamoDBLib from "../libs/dynamodb-lib";
import { TCombinedAllReadIndex, TAuthTableReadIndex } from "../types/types";
import DefaultController from "./default";

class AuthTableController extends DefaultController {
    constructor(tableName: string) {
        super(tableName)
    }

    private PKSKMapper: Record<TAuthTableReadIndex, { PK: string, SK: string }> = {
        "uniqueId-Index": {
            PK: "uniqueId",
            SK: ""
        }
    }

    private generateReadParams(readIndex: TCombinedAllReadIndex, PK: string, SK?: string, filter?: Record<string, string>, SKBeginsWith?: boolean) {
        const params = super.generateReadParamsDefault(this.PKSKMapper, readIndex, PK, SK, filter, SKBeginsWith);
        return params
    }

    async read(readIndex: TCombinedAllReadIndex, PK: string, SK?: string, SKBeginsWith: boolean = false): Promise<any> {
        if (readIndex !== "uniqueId-Index") {
            throw new Error("해당 Table에서 사용할 수 없는 Index입니다.")
        }

        const params: Record<string, any> = this.generateReadParams(readIndex, PK, SK, undefined, SKBeginsWith);

        const result = await dynamoDBLib.call("query", params);
        return result;
    }

    async readWithFilter(readIndex: TCombinedAllReadIndex, PK: string, SK?: string, filter?: Record<string, string>, SKBeginsWith: boolean = false): Promise<any> {
        if (readIndex !== "uniqueId-Index") {
            throw new Error("해당 Table에서 사용할 수 없는 Index입니다.")
        }

        const params = this.generateReadParams(readIndex, PK, SK, filter, SKBeginsWith);

        const result = await dynamoDBLib.call("query", params);
        return result;
    }
}

export default AuthTableController