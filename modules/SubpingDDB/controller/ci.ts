import CiModel from "../model/ci";
import DefaultController from "./default";
import { TReadIndex } from "../types/types";

class CiController extends DefaultController<CiModel> {
    async create(tableName: string, property: CiModel) {
        await super.create(tableName, property)
    }

    async read(tableName: string, readIndex: TReadIndex, PK: string, SK?: string) {
        const result = await super.read(tableName, readIndex, PK, SK);
        return result;
    }

    async readSKBeginsWith(tableName: string, readIndex: TReadIndex, PK: string, SK: string) {
        const result = await super.readSKBeginsWith(tableName, readIndex, PK, SK);
        return result;
    }

    async readWithFilter() {

    }

    async delete() {

    }
}

export default CiController;