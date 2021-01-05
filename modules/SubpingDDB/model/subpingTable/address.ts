import DefaultModel from "./default";

interface AddressModel extends DefaultModel {
    addressName: string;
    postCode: string;
    address: string;
    detailedAddress: string;
}

export default AddressModel;