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
    queryReview(reviewId: string): Promise<Review> {
        return this.findOne(reviewId);
    }

    // 해당 리뷰 업데이트
    async updateReview(reviewId: string, title?: string, content?: string): Promise<void> {
        if(title){
            await this.update(reviewId, { title: title});
        };

        if(content){
            await this.update(reviewId, { content: content});
        };

        if(!title && !content){
            throw console.log("[Subping] Review 수정할 데이터가 없습니다.");
        };
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
                limit: number,
                page: number,
                standardTime: string
            }
        }) {
        const { serviceId , userId, pagination } = options;

        let reviews = this.createQueryBuilder("review")
            .select("review.*")
            .addSelect("user.nickName", "nickName")
            .addSelect("GROUP_CONCAT(DISTINCT reviewImage.imageUrl)", "reviewImage")
            .innerJoin("review.user", "user")
            .leftJoin("review.images", "reviewImage")
            .groupBy("review.user")

        if (serviceId){
            reviews = reviews.where(`review.service = "${serviceId}"`);
        }

        if (userId){
            reviews = reviews.where(`review.user = "${userId}"`);
        }

        if (pagination) {
            if (pagination.limit && pagination.page && pagination.standardTime) {
                reviews = reviews
                    .andWhere(`review.createdAt < "${pagination.standardTime}"`)
                    .offset(pagination.limit * (pagination.page - 1))
                    .limit(pagination.limit)
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