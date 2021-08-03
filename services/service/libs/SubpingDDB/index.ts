import SubpingTableController from "./controller/subpingTable"
import KeyTableController from "./controller/keyTable"
import AuthTableController from "./controller/authTable"

class SubpingDDB {
    private tableName: string;

    constructor(tableName: string) {
        this.tableName = tableName
    }

    getController(): SubpingTableController | KeyTableController | AuthTableController {
        if (this.tableName.includes("core")) {
            return new SubpingTableController(this.tableName);
        }

        else if (this.tableName.includes("key")) {
            return new KeyTableController(this.tableName);
        }

        else if (this.tableName.includes("auth")) {
            return new AuthTableController(this.tableName);
        }

        else {
            throw new Error("존재하지 않는 Table 입니다.")
        }
    }
}

export default SubpingDDB;
