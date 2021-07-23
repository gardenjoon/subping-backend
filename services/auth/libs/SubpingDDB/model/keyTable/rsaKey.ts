import DefaultModel from "./default"

interface RsaModel extends DefaultModel {
    publicKey: string;
    privateKey: string;
}

export default RsaModel;