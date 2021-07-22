import SubpingRDB from "subpingrdb";
import { APIGatewayProxyHandler } from 'aws-lambda';

import { success, failure } from "../../libs/response-lib";


export const handler: APIGatewayProxyHandler = async (event, _context) => {
    try {
        const subpingRDB = new SubpingRDB();
        const connection = await subpingRDB.createConnection("dev");
        console.log(connection);
        
        // let response: CategoryModel[] = [];
        
        // const subpingDDB = new SubpingDDB(process.env.subpingTable);
        // const controller = subpingDDB.getController();
        
        // response = (await controller.read("model-PK-Index", "category")).Items;

        return success({
            success: true,
            message: "done"  
        })
    }

    catch (e) {
        console.log(e);
        return failure({
            success: false,
            message: "GetServicesException"
        })
    }
}

