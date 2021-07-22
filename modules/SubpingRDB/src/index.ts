import "reflect-metadata";
import {createConnection, getConnectionOptions} from "typeorm";

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

type StageType = "prod" | "dev";

class SubpingRDB {
    async createConnection(stage: StageType) {
        const options = await getConnectionOptions();
        
        Object.assign(options, {
            type: "aurora-data-api",
            database: `subping`,
            secretArn: "arn:aws:secretsmanager:ap-northeast-2:068162191174:secret:dev/admin/subping-xQSws2",
            resourceArn: "arn:aws:rds:ap-northeast-2:068162191174:cluster:subping-dev",
            region: "ap-northeast-2",
        })

        return await createConnection(options)
    }    
}

export const Entity = {
    User: User,
    Alarm: Alarm,
    Category: Category,
    Product: Product,
    Review: Review,
    ReviewImage: ReviewImage,
    Seller: Seller,
    Service: Service,
    ServiceCategory: ServiceCategory,
    ServiceEvent: ServiceEvent,
    ServiceRank: ServiceRank,
    UserAddress: UserAddress
}

export default SubpingRDB;