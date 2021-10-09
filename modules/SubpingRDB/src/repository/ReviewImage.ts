import { EntityRepository, Repository } from "typeorm";
import { Review } from "../entity/Review";
import { ReviewImage } from "../entity/ReviewImage";

@EntityRepository(ReviewImage)
export class ReviewImageRepository extends Repository<ReviewImage> {
    async createReviewImage(reviewId: string, reviewImageUrl: string, index: number) {
        const reviewModel = new Review();
        reviewModel.id = reviewId;

        const reviewImageModel = new ReviewImage();
        reviewImageModel.review = reviewModel;
        reviewImageModel.imageUrl = reviewImageUrl;
        reviewImageModel.imageIndex = index;

        return await this.save(reviewImageModel)
    }

    queryReviewImages(reviewId: string) {
        return this.createQueryBuilder("reviewImage")
            .select("reviewImage.*")
            .where(`reviewImage.review = "${reviewId}"`)
            .orderBy("reviewImage.imageIndex")
            .getRawMany();
    }

    updateReviewImage(reviewImageId: string, imageUrl: string, index: number) {
        return this.update(reviewImageId, {
            imageUrl: imageUrl,
            imageIndex: index
        })
    }
}