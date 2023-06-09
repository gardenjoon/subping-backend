import SubpingRDB, { Repository } from "subpingrdb";

import { APIGatewayProxyHandler } from 'aws-lambda';
import { success, failure } from "../../libs/response-lib";

export const handler: APIGatewayProxyHandler = async (event, _context) => {
    try {
        const userId = event.headers.id;
        const body = JSON.parse(event.body || "");
        const { category } = body;

        const subpingRDB = new SubpingRDB();
        const connection = await subpingRDB.getConnection("dev");
        const serviceRepository = connection.getCustomRepository(Repository.Service);

        const services = await serviceRepository.queryServices({
            category: true,
            filter: {
                categoryName: category
            },
            like: {
                userId: userId
            }
        });

        return success({
            success: true,
            message: services
        });
    }

    catch (e) {
        console.log(e);
        return failure({
            success: false,
            message: "getServicesException"
        });
    }
}