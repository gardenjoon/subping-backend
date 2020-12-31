import { TModels, TControllers } from "./types/types"
import Controller from "./controller/"

class SubpingDDB {
    private tableName: string;

    constructor(tableName: string) {
        this.tableName = tableName
    }

    getController(model: TModels): TControllers {
        const controller = new Controller[model]();

        return controller;
    }
}

export default SubpingDDB;
