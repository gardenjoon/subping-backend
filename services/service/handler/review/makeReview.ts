import SubpingRDB, { Repository, Entity } from "subpingrdb";

import { APIGatewayProxyHandler } from 'aws-lambda';
import { success, failure } from "../../libs/response-lib";

export const handler: APIGatewayProxyHandler = async (event, _context) => {
    try {
        const body = JSON.parse(event.body || "");
        const userId = event.headers.id;

        const { serviceId, content, rating, imageUrl } = body;

        const subpingRDB = new SubpingRDB();
        const connection = await subpingRDB.getConnection("dev");
        const reviewRepository = connection.getCustomRepository(Repository.Review);
        const reviewImageRepository = connection.getCustomRepository(Repository.ReviewImage);

        const userModel = new Entity.User();
        userModel.id = userId

        const reviewModel = new Entity.Review();
        reviewModel.user = userModel;
        reviewModel.service = serviceId;
        reviewModel.content = content;
        reviewModel.rating = rating;
        await reviewRepository.createReview(reviewModel);

        if (imageUrl){
            for (const [index, newImageUrl] of imageUrl.entries()) {
                await reviewImageRepository.createReviewImage(reviewModel.id, newImageUrl, index+1)
            }
        }

        return success({
            success: true,
            message: "makeReviewSuccess"
        });
    }

    catch (e) {
        console.log(e);
        return failure({
            success: false,
            message: "makeReviewException"
        });
    }
}