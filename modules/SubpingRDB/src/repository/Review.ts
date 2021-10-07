import { EntityRepository, Repository } from "typeorm";
import { Review } from "../entity/Review";

@EntityRepository(Review)
export class ReviewRepository extends Repository<Review> {
    // 리뷰 생성
    async createReview(reviewModel: Review): Promise<void> {
        await this.save(reviewModel);
    }

    // 리뷰 제거
    async deleteReview(reviewId: string): Promise<void> {
        await this.delete({ id : reviewId });
    }

    // 모든 리뷰 반환
    queryAllReviews(): Promise<Review[]> {
        return this.find();
    }

    // 해당 리뷰 반환
    queryReview(reviewId: string) {
        return this.createQueryBuilder("review")
            .select("review.*")
            .where(`id = "${reviewId}"`)
            .getRawOne();
    }

    // 해당 리뷰 업데이트
    async updateReview(reviewId: string, options?: {
        content?: string,
        rating?: number,
        reviewImageUrl?: string
    }): Promise<void> {
        const review = await this.findOne(reviewId);

        await this.update(reviewId, {
            content: options.content || review.content,
            rating: options.rating || review.rating
        })
    }

    /* 
        유저 또는 서비스에 속하는 모든 리뷰 반환
        유저와 상품의 Id를 요청받고, 둘중 하나만 있어야함
        상품Id로 반환할때만 닉네임을 포함
        리뷰이미지를 리스트형식으로 반환하고, 없으면 null 반환
    */
        async queryReviews(options?:{
            serviceId?: string,
            userId?: string,
            pagination?: {
                take: number,
                skip: number,
                standardTime: string,
            }
        }) {
        const { serviceId , userId, pagination } = options;

        let reviews = this.createQueryBuilder("review")
            .select("review.*")
            .addSelect("user.nickName", "nickName")
            .addSelect("GROUP_CONCAT(DISTINCT reviewImage.imageUrl)", "reviewImage")
            .innerJoin("review.user", "user")
            .leftJoin("review.images", "reviewImage")
            .orderBy("review.updatedAt", "DESC")
            .groupBy("review.id")

        if (serviceId){
            reviews = reviews.andWhere(`review.service = "${serviceId}"`);
        }

        if (userId){
            reviews = reviews.andWhere(`review.user = "${userId}"`);
        }

        if (pagination) {
            if (pagination.take && pagination.skip && pagination.standardTime) {
                reviews = reviews
                    .andWhere(`review.createdAt < "${pagination.standardTime}"`)
                    .skip(pagination.take * (pagination.skip - 1))
                    .take(pagination.take)
            }

            else {
                throw console.log("[SubpingRDB] pagination 파라미터가 없습니다.")
            }
        }

        const result = await reviews.getRawMany();

        result.map(result => {
            if (result.reviewImage){
                result.reviewImage = (result.reviewImage.includes(',')) ? result.reviewImage.split(',') : result.reviewImage.split();
            };
        });

        return result
    }

    // 검색어와 제목과 내용이 일치하는 모든 리뷰 반환
    async searchReviews(requestWord: string){
        const reviews = await this.createQueryBuilder("review")
            .select("review.*")
            .addSelect("GROUP_CONCAT(DISTINCT reviewImage.imageUrl)", "reviewImage")
            .where(`content LIKE "%${requestWord}%"`)
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