import SubpingRDB, { Repository } from "subpingrdb";

import { APIGatewayProxyHandler } from 'aws-lambda';
import { success, failure } from "../../libs/response-lib";

export const handler: APIGatewayProxyHandler = async (event, _context) => {
    try {
        const PK = event.headers.email;
        const body = JSON.parse(event.body || "");
        const { category } = body;

        let standardTime = new Date();
        standardTime.setHours(standardTime.getHours() + 9);

        const subpingRDB = new SubpingRDB();
        const connection = await subpingRDB.getConnection("dev");
        const serviceRepository = connection.getCustomRepository(Repository.Service);

        const services = await serviceRepository.getServicesWithCategory(category, PK);

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