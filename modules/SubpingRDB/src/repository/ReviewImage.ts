import { EntityRepository, Repository } from "typeorm";
import { Review } from "../entity/Review";
import { ReviewImage } from "../entity/ReviewImage";

@EntityRepository(ReviewImage)
export class ReviewImageRepository extends Repository<ReviewImage> {
    async createReviewImage(reviewId: string, reviewImageUrl: string) {
        const reviewModel = new Review();
        reviewModel.id = reviewId;

        const reviewImageModel = new ReviewImage();
        reviewImageModel.review = reviewModel;
        reviewImageModel.imageUrl = reviewImageUrl;

        return await this.save(reviewImageModel)
    }

    queryReviewImage(reviewId: string) {
        return this.createQueryBuilder("reviewImage")
            .select("reviewImage.*")
            .where(`reviewImage.review = "${reviewId}"`)
            .getRawMany();
    }
}