import "reflect-metadata";
import { createConnection, getConnectionManager, Connection } from "typeorm";
import { Alarm } from "./entity/Alarm";
import { Category } from "./entity/Category";
import { Product } from "./entity/Product";
import { Review } from "./entity/Review";
import { ReviewImage } from "./entity/ReviewImage";
import { Seller } from "./entity/Seller";
import { Service } from "./entity/Service";
import { ServiceCategory } from "./entity/ServiceCategory";
import { ServiceEvent } from "./entity/ServiceEvent";
import { ServiceRank } from "./entity/ServiceRank";
import { User } from "./entity/User";
import { UserAddress } from "./entity/UserAddress";
import { UserLike } from "./entity/UserLike";
import { UserCard } from "./entity/UserCard";
import { ServiceTag } from "./entity/ServiceTag";
import { Subscribe } from "./entity/Subscribe"
import { Payment } from "./entity/Payment";
import { ServicePeriod } from "./entity/ServicePeriod";
import { SubscribeItem } from "./entity/SubscribeItem";

import { UserRepository } from "./repository/User";
import { CategoryRepository } from "./repository/Category";
import { ServiceRepository } from "./repository/Service";
import { SellerRepository } from "./repository/Seller";
import { AlarmRepository } from "./repository/Alarm";
import { ServiceEventRepository } from "./repository/ServiceEvent";
import { ServiceTagRepository } from "./repository/ServiceTags";
import { ProductRepository } from "./repository/Product";
import { SubscribeRepository } from "./repository/Subscribe";
import { UserLikeRepository } from "./repository/UserLike";
import { ReviewRepository } from "./repository/Review";
import { ReviewImageRepository } from "./repository/ReviewImage";
import { UserAddressRepository } from "./repository/UserAddress";
import { UserCardRepository } from "./repository/UserCard";
import { PaymentRepository } from "./repository/Payment";
import { Reward } from "./entity/Reward";
import { RewardItem } from "./entity/RewardItem";

process.env.TZ = "UTC";

type StageType = "prod" | "dev";

export const Entity = {
    User: User,
    UserLike: UserLike,
    UserAddress: UserAddress,
    UserCard: UserCard,
    Alarm: Alarm,
    Category: Category,
    Product: Product,
    Review: Review,
    Reward: Reward,
    RewardItem: RewardItem,
    ReviewImage: ReviewImage,
    Seller: Seller,
    Service: Service,
    ServiceCategory: ServiceCategory,
    ServiceEvent: ServiceEvent,
    ServiceRank: ServiceRank,
    ServiceTag: ServiceTag,
    ServicePeriod: ServicePeriod,
    Subscribe: Subscribe,
    SubscribeItem: SubscribeItem,
    Payment: Payment
}

export const Repository = {
    User : UserRepository,
    UserLike: UserLikeRepository,
    UserCard: UserCardRepository,
    Category: CategoryRepository,
    Service: ServiceRepository,
    Seller: SellerRepository,
    ServiceEvent: ServiceEventRepository,
    ServiceTag: ServiceTagRepository,
    Alarm: AlarmRepository,
    Product: ProductRepository,
    Subscribe: SubscribeRepository,
    Review: ReviewRepository,
    ReviewImage: ReviewImageRepository,
    UserAddress: UserAddressRepository,
    Payment: PaymentRepository
}


class SubpingRDB {
    async getConnection(stage: StageType) {
        const CONN_NAME = "default";
        const connManager = getConnectionManager();
        
        let conn: Connection;

        if(connManager.has(CONN_NAME)) {
            conn = connManager.get(CONN_NAME);

            if(!conn.isConnected) {
                conn = await conn.connect();
            }
        }

        else {
            conn = await this._createConnection(stage);
        }
        
        return conn;
    }

    async _createConnection(stage: StageType) {
        return await createConnection({
            type: "aurora-data-api",
            database: `subping`,
            secretArn: "arn:aws:secretsmanager:ap-northeast-2:068162191174:secret:dev/admin/subping-xQSws2",
            resourceArn: "arn:aws:rds:ap-northeast-2:068162191174:cluster:subping-dev",
            region: "ap-northeast-2",
            entities: Object.values(Entity),
            extra: {
                "charset": "utf8mb4_unicode_ci"
            }
        })
    }
}

export default SubpingRDB;