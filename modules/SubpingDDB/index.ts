import Controller from "./controller"
class SubpingDDB {
    private tableName: string;

    constructor(tableName: string) {
        this.tableName = tableName
    }

    getController(): Controller {
        const controller = new Controller(this.tableName);

        return controller;
    }
}

export default SubpingDDB;
