import { generateKeyPair } from "crypto";
import JSEncrypt from "node-jsencrypt";

const RSA = {
    generateKeyPair: async function (keySize = 1024): Promise<{ privateKey: string, publicKey: string }> {
        let keys = {
            privateKey: "",
            publicKey: ""
        }

        await new Promise((resolve, reject) => generateKeyPair('rsa', {
            modulusLength: keySize,
            publicKeyEncoding: {
                type: 'spki',
                format: 'pem'
            },
            privateKeyEncoding: {
                type: 'pkcs8',
                format: 'pem',
            }
        }, (err, publicKey, privateKey) => {
            console.log(err, publicKey, privateKey)
            if (err) {
                reject()
            }

            keys["privateKey"] = privateKey
            keys["publicKey"] = publicKey

            resolve(null)
        }))

        return keys
    },

    encrypt: async function (message, publicKey) {
        const crypt = new JSEncrypt();
        crypt.setKey(publicKey);
        const encrypted = crypt.encrypt(message);

        return encrypted
    },

    decrypt: async function (message, privateKey) {
        const crypt = new JSEncrypt();
        console.log("privateKey", privateKey)
        crypt.setPrivateKey(privateKey);
        const decrypted = crypt.decrypt(message);

        return decrypted
    },

}

export default RSA