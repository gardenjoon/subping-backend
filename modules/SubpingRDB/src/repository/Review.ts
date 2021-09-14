import { EntityRepository, Repository } from "typeorm";
import { Review } from "../entity/Review";

@EntityRepository(Review)
export class ReviewRepository extends Repository<Review> {
    findAllReview(): Promise<Review[]> {
        return this.find();
    }

    findOneReview(reviewId: string): Promise<Review> {
        return this.findOne(reviewId);
    }

    async saveReview(Review: Review): Promise<void> {
        await this.save(Review);
    }

    async deleteReview(id: string): Promise<void> {
        await this.delete({ id : id });
    }

    async getReviews(options?:{
            productId?: string,
            userId?: string
        }) {
        const { productId , userId } = options;

        let reviews = this.createQueryBuilder("review")
            .select("review.*")
            .addSelect("GROUP_CONCAT(DISTINCT reviewImage.imageUrl)", "reviewImage")
            .innerJoin("review.user", "user")
            .innerJoin("review.product", "product")
            .leftJoin("review.images", "reviewImage")
            .groupBy("review.user")

        if (productId && !userId){
            reviews = reviews
                .addSelect("user.nickName", "nickName")
                .where(`review.product = "${productId}"`);
        }

        else if (!productId && userId){
            reviews = reviews.where(`review.user = "${userId}"`);
        }

        else {
            return "[SubpingRDB] productId나 userId 둘중 하나만 있어야 합니다."
        }

        const result = await reviews.getRawMany();

        result.map(result => {
            if (result.reviewImage){
                result.reviewImage = (result.reviewImage.includes(',')) ? result.reviewImage.split(',') : result.reviewImage.split();
            };
        });

        return result
    }

    async searchReview(requestWord){
        const reviews = await this.createQueryBuilder("review")
            .select("review.*")
            .addSelect("GROUP_CONCAT(DISTINCT reviewImage.imageUrl)", "reviewImage")
            .where(`title LIKE "%${requestWord}%"`)
            .orWhere(`content LIKE "%${requestWord}%"`)
            .leftJoin("review.images", "reviewImage")
            .groupBy("review.user")
            .getRawMany();
        reviews.map(review => {
            if (review.reviewImage){
                review.reviewImage = (review.reviewImage.includes(',')) ? review.reviewImage.split(',') : review.reviewImage.split();
            };
        });
        return reviews
    }
}