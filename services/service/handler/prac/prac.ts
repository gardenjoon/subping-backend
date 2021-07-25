import SubpingRDB, { Repository } from "subpingrdb";

import { APIGatewayProxyHandler } from 'aws-lambda';
import { success, failure } from "../../libs/response-lib";
import { v4 as uuidv4 } from 'uuid';


export const handler: APIGatewayProxyHandler = async (event, _context) => {
    const test = async() => {
        const subpingRDB = new SubpingRDB();
        const connection = await subpingRDB.getConnection("dev");
        const UserRepository = connection.getCustomRepository(Repository.UserRepository)
        
        console.log(await UserRepository.findByName("정승우"));
        
        console.log("madesuccess");
    }
    try {
        await test()
        return success({
            success: true,
            message: "Success"
        })
        
    }

    catch (e) {
        console.log(e);
        return failure({
            success: false,
            message: "MakeServiceException"
        })
    }
}

