import SubpingDDB from "subpingddb";
import ServiceModel from "subpingddb/model/subpingTable/service"
import { APIGatewayProxyHandler } from 'aws-lambda';

import { success, failure } from "../../libs/response-lib";

export const handler: APIGatewayProxyHandler = async (event, _context) => {
    try {
        // const header = event.headers;
        // const PK = header.pk;

        // const result: Array<ServiceModel> = []

        const subpingDDB = new SubpingDDB(process.env.subpingTable);
        const controller = subpingDDB.getController();

        const services = await controller.read("model-PK-Index", "service");
        services.Items.push(services.Items[0])
        services.Items.push(services.Items[0])
        services.Items.push(services.Items[0])
        services.Items.push(services.Items[0])
        services.Items.push(services.Items[0])
        services.Items.push(services.Items[0])
        services.Items.push(services.Items[0])
        services.Items.push(services.Items[0])
        services.Items.push(services.Items[0])
        services.Items.push(services.Items[0])
        services.Items.push(services.Items[0])
        services.Items.push(services.Items[0])

        return success({
            success: true,
            message: services.Items
        })
    }

    catch (e) {
        console.log(e);
        return failure({
            success: false,
            message: "CurrentHotChartException"
        })
    }
}
