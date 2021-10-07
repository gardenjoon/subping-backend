import SubpingRDB, { Repository } from "subpingrdb";

import { APIGatewayProxyHandler } from 'aws-lambda';
import { success, failure } from "../../libs/response-lib";

export const handler: APIGatewayProxyHandler = async (event, _context) => {
    try {
        const body = JSON.parse(event.body || "");
        const userId = event.headers.id;

        const { reviewId } = body;

        const subpingRDB = new SubpingRDB();
        const connection = await subpingRDB.getConnection("dev");
        const reviewRepository = connection.getCustomRepository(Repository.Review);
        const targetReview = await reviewRepository.queryReview(reviewId)

        if (targetReview.userId === userId) {
            await reviewRepository.deleteReview(reviewId)

            return success({
                success: true,
                message: "deleteReviewSuccess"
            });
        }

        else {
            return failure({
                success: false,
                message: "InvalidUserException"
            })
        }

    }
    catch (e) {
        console.log(e);
        return failure({
            success: false,
            message: "deleteReviewException"
        });
    }
}