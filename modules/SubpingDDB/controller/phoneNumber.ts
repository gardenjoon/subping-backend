import PhoneNumberModel from "../model/phoneNumber";
import DefaultController from "./default";

class CiController extends DefaultController<PhoneNumberModel> {
    public data: PhoneNumberModel[] | null = null;

    async create(tableName: string, property: PhoneNumberModel) {
        await super.create(tableName, property)
    }
}

export default CiController;