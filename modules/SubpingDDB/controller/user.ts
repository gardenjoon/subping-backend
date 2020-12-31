import UserModel from "../model/user";
import DefaultController from "./default";

class CiController extends DefaultController<UserModel> {
    public data: UserModel[] | null = null;

    async create(tableName: string, property: UserModel) {
        await super.create(tableName, property)
    }
}

export default CiController;