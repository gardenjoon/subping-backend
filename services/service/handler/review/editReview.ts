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
        const targetReviewImages = await reviewImageRepository.queryReviewImages(reviewId)

        if (targetReview.userId === userId) {
            await reviewRepository.updateReview(reviewId, {
                content: content,
                rating: rating
            });

            for (let i = 0; i < 5; i++) {
                if (targetReviewImages[i] && reviewImageUrl[i] && (reviewImageUrl[i] !== targetReviewImages[i].imageUrl)){
                    await reviewImageRepository.updateReviewImage(targetReviewImages[i].id, reviewImageUrl[i], i+1)
                }
                else if (!targetReviewImages[i] && reviewImageUrl[i]) {
                    await reviewImageRepository.createReviewImage(reviewId, reviewImageUrl[i], i+1)
                }
                else if (targetReviewImages[i] && !reviewImageUrl[i]) {
                    await reviewImageRepository.delete({ id : targetReviewImages[i].id})
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