import DefaultModel from "./default"

interface AuthModel extends DefaultModel {
    email: string;
    password: string;
    ttl: number;
}

export default AuthModel;