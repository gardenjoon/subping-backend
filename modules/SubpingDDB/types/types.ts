import AddressModel from "../model/address"
import CiModel from "../model/ci"
import UserModel from "../model/user"
import PhoneNumberModel from "../model/phoneNumber"

import AddressController from "../controller/address"
import CiController from "../controller/ci"
import UserController from "../controller/user"
import PhoneNumberController from "../controller/phoneNumber"

export type TModels = "address" | "ci" | "user" | "phoneNumber";
export type TReadIndex = "PK-SK-Index" | "model-PK-Index" | "PK-createdAt-Index" | "PK-updatedAt-Index" | "SK-PK-Index"
export type TInterfaceModels = AddressModel | CiModel | UserModel | PhoneNumberModel;
export type TControllers = AddressController | CiController | UserController | PhoneNumberController