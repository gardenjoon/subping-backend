import DefaultModel from "./default";

interface UserModel extends DefaultModel {
    birthday: string;
    name: string;
}

export default UserModel;