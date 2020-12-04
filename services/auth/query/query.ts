export const makeAuth = (uniqueId: String, email: String, password: String, ttl: Number) => {
    return {
        TableName: process.env.authTable,
        Item: {
            uniqueId: uniqueId,
            email: email,
            password: password,
            ttl: ttl
        }
    }
}

export const makeUser = (PK: String, name: String, birthDay: String, CI: String, phoneNumber: String, carrier: String) => {
    return {
        TransactItems: [
            {
                Put: {
                    TableName: process.env.subpingTable,
                    Item: {
                        PK: PK,
                        SK: `user`,
                        model: 'user',
                        name: name,
                        birthDay: birthDay,
                        createdAt: new Date().toISOString(),
                        updatedAt: new Date().toISOString(),
                    }
                }
            },
            {
                Put: {
                    TableName: process.env.subpingTable,
                    Item: {
                        PK: PK,
                        SK: `ci`,
                        model: 'ci',
                        ci: CI,
                        createdAt: new Date().toISOString(),
                        updatedAt: new Date().toISOString(),
                    }
                }
            },
            {
                Put: {
                    TableName: process.env.subpingTable,
                    Item: {
                        PK: PK,
                        SK: `phoneNumber`,
                        model: 'phoneNumber',
                        phoneNumber: phoneNumber,
                        carrier: carrier,
                        createdAt: new Date().toISOString(),
                        updatedAt: new Date().toISOString(),
                    }
                }
            }
        ]
    }
}

export const getAuth = (uniqueId: String) => {
    return {
        TableName: process.env.authTable,
        Key: {
            uniqueId: uniqueId,
        }
    };
}

export const getRSAKey = (uniqueId: String) => {
    return {
        TableName: process.env.keyTable,
        Key: {
            uniqueId: uniqueId,
        }
    };
}

export const putRSAKey = (uniqueId: String, publicKey: String, privateKey: String) => {
    return {
        TableName: process.env.keyTable,
        Item: {
            uniqueId: uniqueId,
            publicKey: publicKey,
            privateKey: privateKey,
        }
    };
}

export const getUser = (PK: String) => {
    return {
        TableName: process.env.subpingTable,
        KeyConditionExpression: "PK = :PK",
        FilterExpression:
            "model = :model",
        ExpressionAttributeValues: {
            ":PK": PK,
            ":model": "user"
        },
    };
}

export const getUserAllAttr = (PK: String) => {
    return {
        TableName: process.env.subpingTable,
        KeyConditionExpression: "PK = :PK",
        ExpressionAttributeValues: {
            ":PK": PK,
        },
    };
}

export const deleteAttr = (PK: String, SK: String) => {
    return {
        TableName: process.env.subpingTable,
        Key: {
            PK: PK,
            SK: SK,
        },
    }
}

