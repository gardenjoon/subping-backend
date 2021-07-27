import SubpingRDB, { Repository } from "subpingrdb";

import { APIGatewayProxyHandler } from 'aws-lambda';
import { success, failure } from "../../libs/response-lib";
import { v4 as uuidv4 } from 'uuid';


export const handler: APIGatewayProxyHandler = async (event, _context) => {
    const test = async() => {
        const subpingRDB = new SubpingRDB();
        const connection = await subpingRDB.getConnection("dev");
        const categoryRepository = connection.getCustomRepository(Repository.Service)
        const res = await categoryRepository.getServicesWithCategory("사회");
        console.log(res);        
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

