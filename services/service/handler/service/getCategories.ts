import SubpingDDB from "subpingddb";
import { APIGatewayProxyHandler } from 'aws-lambda';

import ServiceModel from "subpingddb/model/subpingTable/service"
import CategoryModel from "../../../../modules/SubpingDDB/model/subpingTable/category";
import { success, failure } from "../../libs/response-lib";

interface Category {
    [key:string]: Array<ServiceModel>
}

export const handler: APIGatewayProxyHandler = async (event, _context) => {
    try {
        let response: CategoryModel[] = [];
        
        const subpingDDB = new SubpingDDB(process.env.subpingTable);
        const controller = subpingDDB.getController();
        
        response = (await controller.read("model-PK-Index", "category")).Items;

        return success({
            success: true,
            message: response  
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

