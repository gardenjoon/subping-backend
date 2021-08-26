import SubpingRDB, { Repository } from "subpingrdb";

import { APIGatewayProxyHandler } from 'aws-lambda';
import { success, failure } from "../../libs/response-lib";

export const handler: APIGatewayProxyHandler = async (event, _context) => {
    try {
        const body = JSON.parse(event.body || "");
        const { limit, page } = body;

        let standardTime = new Date();
        standardTime.setHours(standardTime.getHours() + 9);

        const subpingRDB = new SubpingRDB();
        const connection = await subpingRDB.getConnection("dev");
        const serviceRepository = connection.getCustomRepository(Repository.Service);

        const services = await serviceRepository.getServices({
            category: true,
            tag:  true,
            standardTime: standardTime.toISOString(),
            pagination: {
                limit: limit,
                page: page
            }
        });

        if (services.length === 0){
            throw 'NoMoreServices';
        }
        else {
            return success({
                success: true,
                message: services
            });
        }
    }

    catch (e) {
        console.log(e);
        return failure({
            success: false,
            message: "getServicesException"
        });
    }
}