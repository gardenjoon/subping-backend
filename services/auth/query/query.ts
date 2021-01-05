export const makeUser = (PK: String, name: String, birthDay: String, CI: String, phoneNumber: String, carrier: String) => {
    return {
        TransactItems: [
            {
                Put: {
                    TableName: process.env.subpingTable,
                    Item: {
                        PK: PK,
                        SK: `user#${name}`,
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
                        SK: `ci#${CI}`,
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
                        SK: `phoneNumber#${phoneNumber}`,
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