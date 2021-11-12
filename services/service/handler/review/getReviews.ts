import SubpingRDB, { Repository } from "subpingrdb";

import { APIGatewayProxyHandler } from 'aws-lambda';
import { success, failure } from "../../libs/response-lib";

export const handler: APIGatewayProxyHandler = async (event, _context) => {
    try {
        const body = JSON.parse(event.body || "");
        const userId = event.headers.id;

        const serviceId = body.serviceId || null;
        const take = body.take || 100;
        const skip = body.skip || 1;
        const currentTime = new Date().toISOString();

        const subpingRDB = new SubpingRDB();
        const connection = await subpingRDB.getConnection("dev");
        const reviewRepository = connection.getCustomRepository(Repository.Review);

        const reviews = await reviewRepository.queryReviews({
            serviceId: serviceId,
            userId: userId,
            pagination: {
                take : take,
                skip: skip,
                standardTime: currentTime
            }
        });

        return success({
            success: true,
            message: reviews
        });
    }
    catch (e) {
        console.log(e);
        return failure({
            success: false,
            message: "getReviewsException"
        });
    }
}