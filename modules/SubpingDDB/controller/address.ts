import AddressModel from "../model/address";
import DefaultController from "./default";

class AddressController extends DefaultController<AddressModel> {
    public data: AddressModel[] | null = null;
}


export default AddressController
