import SubpingRDB, { Repository } from "subpingrdb";

import { APIGatewayProxyHandler } from 'aws-lambda';
import { success, failure } from "../../libs/response-lib";

export const handler: APIGatewayProxyHandler = async (event, _context) => {
    try {
        const body = JSON.parse(event.body || "");
        const userId = event.headers.id;

        const { reviewId, reviewImageUrl, content, rating } = body;

        const subpingRDB = new SubpingRDB();
        const connection = await subpingRDB.getConnection("dev");

        const reviewRepository = connection.getCustomRepository(Repository.Review);
        const reviewImageRepository = connection.getCustomRepository(Repository.ReviewImage)

        const targetReview = await reviewRepository.queryReview(reviewId);
        const targetReviewImages = await reviewImageRepository.queryReviewImage(reviewId)

        if (targetReview.userId === userId) {
            await reviewRepository.updateReview(reviewId, {
                content: content,
                rating: rating
            });

            if (reviewImageUrl.length > 0) {
                for (const oldImageUrl of targetReviewImages) {
                    await reviewImageRepository.delete({id : oldImageUrl.id})
                }

                for (const newImageUrl of reviewImageUrl) {
                    await reviewImageRepository.createReviewImage(reviewId, newImageUrl)
                }
            }

            return success({
                success: true,
                message: "editReviewSuccess"
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
            message: "editReviewException"
        });
    }
}