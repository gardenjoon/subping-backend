import SubpingRDB, { Repository } from "subpingrdb";

import { APIGatewayProxyHandler } from 'aws-lambda';
import { success, failure } from "../../libs/response-lib";

export const handler: APIGatewayProxyHandler = async (event, _context) => {
    try {
        const body = JSON.parse(event.body || "");

        const take = body.take || 100;
        const skip = body.skip || 1;
        const currentTime = new Date().toISOString();

        const subpingRDB = new SubpingRDB()
        const connection = await subpingRDB.getConnection("dev");

        const reviewRepository = connection.getCustomRepository(Repository.Review);

        const recentReviews = await reviewRepository.queryReviews({
            pagination: {
                take: take,
                skip: skip,
                standardTime: currentTime
            }
        })

        return success({
            success: true,
            message: recentReviews
        })
    }

    catch (e) {
        console.log(e);
        return failure({
            success: false,
            message: "GetRecentReviewsException"
        });
    }
}