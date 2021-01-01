export const makeUser = (PK: String, name: String, birthDay: String, CI: String, phoneNumber: String, carrier: String) => {
    return {
        TransactItems: [
            {
                Put: {
                    TableName: process.env.subpingTable,
                    Item: {
                        PK: PK,
                        SK: name,
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
                        SK: CI,
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
                        SK: phoneNumber,
                        model: 'phoneNumber',
                        phoneNumber: phoneNumber,
                        carrier: carrier,
                        createdAt: new Date().toISOString(),
                        updatedAt: new Date().toISOString(),
                    }
                }
            },
        ]
    }
}