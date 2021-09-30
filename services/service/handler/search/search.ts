import SubpingRDB, { Repository } from "subpingrdb";

import { APIGatewayProxyHandler } from 'aws-lambda';
import { success, failure } from "../../libs/response-lib";

export const handler: APIGatewayProxyHandler = async (event, _context) => {
    try {
        const body = JSON.parse(event.body || "");

        const { requestWord } = body;

        const subpingRDB = new SubpingRDB();
        const connection = await subpingRDB.getConnection("dev");
        const serviceRepository = connection.getCustomRepository(Repository.Service);
        const reviewRepository = connection.getCustomRepository(Repository.Review);

        const searchService = await serviceRepository.searchServices(requestWord);
        const searchReview = await reviewRepository.searchReviews(requestWord);

        const result = {
            "serviceResult": [...new Set(searchService)],
            "reviewResult": [...new Set(searchReview)]
        };

        return success({
            success: true,
            message: result
        });
    }

    catch (e) {
        console.log(e);
        return failure({
            success: false,
            message: "searchException"
        });
    }
}