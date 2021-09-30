import SubpingRDB, { Repository, Entity } from "subpingrdb";

import { APIGatewayProxyHandler } from 'aws-lambda';
import { success, failure } from "../../libs/response-lib";

export const handler: APIGatewayProxyHandler = async (event, _context) => {
    try {
        const body = JSON.parse(event.body || "");
        const userId = event.headers.id;

        const { serviceId, title, content, rating } = body;

        const subpingRDB = new SubpingRDB();
        const connection = await subpingRDB.getConnection("dev");
        const reviewRepository = connection.getCustomRepository(Repository.Review);

        const reviewModel = new Entity.Review();
        reviewModel.user = userId;
        reviewModel.service = serviceId;
        reviewModel.title = title;
        reviewModel.content = content;
        reviewModel.rating = rating;
        await reviewRepository.createReview(reviewModel);

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