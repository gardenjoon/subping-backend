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
            userEmail?: string
        }) {
        const { productId , userEmail } = options;

        let reviews = this.createQueryBuilder("review")
            .select("review.*")
            .addSelect("GROUP_CONCAT(DISTINCT reviewImage.imageUrl)", "reviewImage")
            .innerJoin("review.user", "user")
            .innerJoin("review.product", "product")
            .leftJoin("review.images", "reviewImage")
            .groupBy("review.user")

        if (productId && !userEmail){
            reviews = reviews
                .addSelect("user.nickName", "nickName")
                .where(`review.product = "${productId}"`);
        }

        else if (!productId && userEmail){
            reviews = reviews.where(`review.user = "${userEmail}"`);
        }

        else {
            return "[SubpingRDB] productId나 userEmail 둘중 하나만 있어야 합니다."
        }

        const result = await reviews.getRawMany();

        result.map(result => {
            if (result.reviewImage){
                result.reviewImage = (result.reviewImage.includes(',')) ? result.reviewImage.split(',') : result.reviewImage.split();
            };
        });

        return result
    }
}