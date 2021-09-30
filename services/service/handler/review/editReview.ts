import SubpingRDB, { Repository } from "subpingrdb";

import { APIGatewayProxyHandler } from 'aws-lambda';
import { success, failure } from "../../libs/response-lib";

export const handler: APIGatewayProxyHandler = async (event, _context) => {
    try {
        const body = JSON.parse(event.body || "");

        const { reviewId, title, content } = body;

        const subpingRDB = new SubpingRDB();
        const connection = await subpingRDB.getConnection("dev");
        const reviewRepository = connection.getCustomRepository(Repository.Review);

        await reviewRepository.updateReview(reviewId, title, content);

        return success({
            success: true,
            message: "editReviewSuccess"
        });
    }

    catch (e) {
        console.log(e);
        return failure({
            success: false,
            message: "editReviewException"
        });
    }
}