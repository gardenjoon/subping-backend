import { APIGatewayProxyEvent } from "aws-lambda";
import { handler as makeReview } from "../handler/review/makeReview";
import { handler as editReview } from "../handler/review/editReview";
import { handler as getReviews } from "../handler/review/getReviews";
import { handler as getRecentReviews } from "../handler/review/getRecentReviews";
import { handler as deleteReview } from "../handler/review/deleteReview";
import { ReviewRepository } from "subpingrdb/dist/src/repository/Review";
import { ReviewImageRepository } from "subpingrdb/dist/src/repository/ReviewImage";
import SubpingRDB from "subpingrdb";
import { mocked } from "ts-jest/utils";

let event: APIGatewayProxyEvent = {
    headers: {
        id : "ce7b86e3-68e3-4ec7-be8b-c519e1bc63d9"
    }
} as any;

mocked(SubpingRDB).prototype.getConnection("dev");

const mJsonParse = jest.fn();
JSON.parse = mJsonParse;

const reviewRepository = ReviewRepository.prototype;
const reviewImageRepository = ReviewImageRepository.prototype;

describe('review', () => {
    test('makeReview', async () => {
        const imageUrls = ["testUrl1"];
        mJsonParse.mockImplementationOnce(() => ({
            serviceId: "4dd6a155-be2e-4ca3-b3b0-6e044d5766dd",
            content: "testContent",
            rating : 3,
            imageUrl : imageUrls
        }));
        reviewRepository.createReview = jest.fn();
        reviewImageRepository.createReviewImage = jest.fn();

        const result = await makeReview(event, null, null);
        expect(result).toHaveProperty("statusCode", 200);
        expect(result).toHaveProperty("body", expect.stringMatching('"success":true,"message":"makeReviewSuccess'));
        expect(reviewRepository.createReview).toHaveBeenCalledTimes(1);
        expect(reviewImageRepository.createReviewImage).toHaveBeenCalledTimes(imageUrls.length);
        for (const [index, image] of imageUrls.entries()) {
            expect(reviewImageRepository.createReviewImage).toBeCalledWith(undefined, image, index+1);
        }
    })

    test('editReview', async () => {
        const expectReviewResult = {
            content: '이게 없다고? 이게 있다고?',
            rating: 5,
            createdAt: '2021-09-23T09:41:02.112Z',
            updatedAt: '2021-10-08T05:43:52.000Z',
            userId: 'ce7b86e3-68e3-4ec7-be8b-c519e1bc63d9',
            serviceId: '4dd6a155-be2e-4ca3-b3b0-6e044d5766dd',
            id: 'bfc692b8-9040-4681-b4d2-25a071b495fd',
            product: null
        };
        const expectReviewImageResult = [
            {
              imageUrl: 'a',
              createdAt: '2021-10-08T05:40:18.147Z',
              updatedAt: '2021-10-08T05:43:52.000Z',
              reviewId: 'bfc692b8-9040-4681-b4d2-25a071b495fd',
              id: '80db025f-5e04-4187-a138-08bc5cd3762d',
              imageIndex: 1
            },
            {
              imageUrl: 'b',
              createdAt: '2021-10-08T05:40:18.463Z',
              updatedAt: '2021-10-08T05:43:52.000Z',
              reviewId: 'bfc692b8-9040-4681-b4d2-25a071b495fd',
              id: '9c0efab9-54e0-48fa-89d2-2caf87bd04be',
              imageIndex: 2
            },
            {
              imageUrl: 'c',
              createdAt: '2021-10-08T05:43:52.537Z',
              updatedAt: '2021-10-08T05:43:52.537Z',
              reviewId: 'bfc692b8-9040-4681-b4d2-25a071b495fd',
              id: '8317ff00-30d6-4629-91f8-6ccb2ecf1a3e',
              imageIndex: 3
            }
        ];
        mJsonParse.mockImplementationOnce(() => ({
            reviewId : "bfc692b8-9040-4681-b4d2-25a071b495fd",
            reviewImageUrl : "testUrl",
            content : "testContent",
            rating : 3
        }));
        reviewRepository.queryReview = jest.fn().mockImplementationOnce(() => (expectReviewResult));
        reviewImageRepository.queryReviewImages = jest.fn().mockImplementationOnce(() => (expectReviewImageResult));

        reviewRepository.updateReview = jest.fn();
        reviewImageRepository.updateReviewImage = jest.fn();
        reviewImageRepository.createReviewImage = jest.fn();
        reviewImageRepository.delete = jest.fn();

        const result = await editReview(event, null, null);
        expect(result).toHaveProperty("statusCode", 200);
        expect(result).toHaveProperty("body", expect.stringMatching('"success":true,"message":"editReviewSuccess'));

        expect(reviewRepository.queryReview).toHaveBeenCalledTimes(1);
        expect(reviewImageRepository.queryReviewImages).toHaveBeenCalledTimes(1);

        expect(reviewRepository.updateReview).toHaveBeenCalledTimes(1);
        expect(reviewImageRepository.updateReviewImage).toHaveBeenCalled();
        expect(reviewImageRepository.createReviewImage).toHaveBeenCalled();
    })

    test('getReviews', async () => {
        let reviewExist = true;
        const expectResult = [
            {
              nickName: 'nickC',
              content: '이게 없다고? 이게 있다고?',
              rating: 5,
              createdAt: '2021-09-23T09:41:02.112Z',
              updatedAt: '2021-10-08T05:43:52.000Z',
              userId: 'ce7b86e3-68e3-4ec7-be8b-c519e1bc63d9',
              serviceId: '4dd6a155-be2e-4ca3-b3b0-6e044d5766dd',
              id: 'bfc692b8-9040-4681-b4d2-25a071b495fd',
              product: null,
              reviewImage: [ 'a', 'c', 'b' ]
            }
        ];
        mJsonParse.mockImplementation(() => ({
            serviceId: "4dd6a155-be2e-4ca3-b3b0-6e044d5766dd",
        }));
        if (reviewExist) {
            reviewRepository.queryReviews = jest.fn().mockImplementationOnce(() => (expectResult));
    
            const result = await getReviews(event, null, null);
            expect(result).toHaveProperty("statusCode", 200);
            expect(result).toHaveProperty("body", expect.stringMatching('"success":true'));
            expect(reviewRepository.queryReviews).toHaveBeenCalledTimes(1);

            reviewExist = false;
        }

        if (!reviewExist) {
            reviewRepository.queryReviews = jest.fn().mockImplementationOnce(() => ([]));

            const result = await getReviews(event, null, null);
            expect(result).toHaveProperty("statusCode", 200);
            expect(result).toHaveProperty("body", expect.stringMatching('"success":false,"message":"NoReviewsException'));
            expect(reviewRepository.queryReviews).toHaveBeenCalledTimes(1);
        }
    })
    test('getRecentReviews', async () => {
        let reviewExist = true;

        const expectResult = [
            {id : "review1"},
            {id : "review2"},
            {id : "review3"},
            {id : "review4"},
            {id : "review5"},
        ];
        mJsonParse.mockImplementation(() => ({}));

        if (reviewExist) {
            reviewRepository.queryReviews = jest.fn().mockImplementationOnce(() => (expectResult));
    
            const result = await getRecentReviews(event, null, null);
            expect(result).toHaveProperty("statusCode", 200);
            expect(result).toHaveProperty("body", expect.stringMatching('"success":true'));
            expect(reviewRepository.queryReviews).toHaveBeenCalledTimes(1);

            reviewExist = false;
        }

        if (!reviewExist) {
            reviewRepository.queryReviews = jest.fn().mockImplementationOnce(() => ([]));

            const result = await getRecentReviews(event, null, null);
            expect(result).toHaveProperty("statusCode", 200);
            expect(result).toHaveProperty("body", expect.stringMatching('"success":false,"message":"NoReviewsException'));
            expect(reviewRepository.queryReviews).toHaveBeenCalledTimes(1);
        }
    })

    test('deleteReview', async () => {
        let userValid = true;

        const expectResult = {
            nickName: 'nickC',
            content: '이게 없다고? 이게 있다고?',
            rating: 5,
            createdAt: '2021-09-23T09:41:02.112Z',
            updatedAt: '2021-10-08T05:43:52.000Z',
            userId: 'ce7b86e3-68e3-4ec7-be8b-c519e1bc63d9',
            serviceId: '4dd6a155-be2e-4ca3-b3b0-6e044d5766dd',
            id: 'bfc692b8-9040-4681-b4d2-25a071b495fd',
            product: null,
            reviewImage: [ 'a', 'c', 'b' ]
        };
        mJsonParse.mockImplementation(() => ({
            reviewId : "bfc692b8-9040-4681-b4d2-25a071b495fd"
        }));
        reviewRepository.queryReview = jest.fn().mockImplementation(() => (expectResult));
        reviewRepository.deleteReview = jest.fn();

        if (userValid) {
            const result = await deleteReview(event, null, null);
            expect(result).toHaveProperty("statusCode", 200);
            expect(result).toHaveProperty("body", expect.stringMatching('"success":true,"message":"deleteReviewSuccess"'));
            expect(reviewRepository.queryReview).toHaveBeenCalledTimes(1);
            expect(reviewRepository.deleteReview).toHaveBeenCalledTimes(1);

            userValid = false;
        }

        if (!userValid) {
            event.headers.id = "7c04a594-6654-4130-a85b-f0165e101dcc";

            const result = await deleteReview(event, null, null);
            expect(result).toHaveProperty("statusCode", 200);
            expect(result).toHaveProperty("body", expect.stringMatching('"success":false,"message":"InvalidUserException'));
            expect(reviewRepository.queryReview).toHaveBeenCalledTimes(2);
        }
    })
})