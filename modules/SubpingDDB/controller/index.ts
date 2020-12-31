import AddressController from "./address";
import CiController from "./ci";
import UserController from "./user";
import PhoneNumberController from "./phoneNumber";

const Controller = {
    address: AddressController,
    ci: CiController,
    phoneNumber: PhoneNumberController,
    user: UserController
}

export default Controller;