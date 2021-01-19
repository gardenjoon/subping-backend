import SubpingDDB from "subpingddb";
import ReviewModel from "subpingddb/model/subpingTable/review";
import { APIGatewayProxyHandler } from 'aws-lambda';

import { success, failure } from "../../libs/response-lib";


const serviceList: ReviewModel[] = [
    {
        PK: "SUB-202001-00001",
        SK: `review#왓챠`,
        createdAt: null,
        updatedAt: null,
        model: "review",
        service: "SUB-202001-00001",
        author: null,
        imagesUrl: [],
        title: "정말 좋아요!",
        content: "사용해본 서비스 중에 가장 좋은거 같은데요?"
    }
]

export const handler: APIGatewayProxyHandler = async (event, _context) => {
    try {
        // const header = event.headers;
        // const PK = header.pk;
        const PK = "jsw9808@gmail.com"

        const serviceModel: ReviewModel = serviceList[0];
        serviceModel['author'] = PK;
        serviceModel['createdAt'] = new Date().toISOString();
        serviceModel['updatedAt'] = new Date().toISOString();

        const subpingDDB = new SubpingDDB(process.env.subpingTable);
        const controller = subpingDDB.getController();

        await controller.create<ReviewModel>(serviceModel);
    }

    catch (e) {
        console.log(e);
        return failure({
            success: false,
            message: "MakeReviewException"
        })
    }
}

