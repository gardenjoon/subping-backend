import SubpingRDB, { Repository, Entity } from "subpingrdb";
import SubpingDDB from "../../libs/SubpingDDB"
import HotChartTimeModel from "../../libs/subpingddb/model/subpingTable/hotChartTime";
import * as moment from "moment-timezone";

import { success, failure } from "../../libs/response-lib";

export const handler = async (event, _context) => {
    const subpingRDB = new SubpingRDB();
    const connection = await subpingRDB.getConnection("dev");

    const body = event;
    const { logourl, userProfileImageUrl, category, seller, service, product,productPeriod, user, subscribe, subscribeItem, alarm, like, review, reviewImage } = body;

    const makeHour = (hour: Number) => {
        let standardHour = null;

        if (6 <= hour && hour < 12) {
            standardHour = "06:00";
        }

        else if (12 <= hour && hour < 18) {
            standardHour = "12:00";
        }

        else if (18 <= hour && hour < 24) {
            standardHour = "18:00";
        }

        else {
            standardHour = "24:00";
        }

        return standardHour;
    }
    const makeCategory = async() => {
        const repository = connection.getCustomRepository(Repository.Category)
        for (const element in category){
            const categoryModel = new Entity.Category();
            categoryModel.name = element
            categoryModel.summary = category[element]
            categoryModel.categoryLogoUrl = null
            await repository.saveCategory(categoryModel)
        }
        console.log("makeCategoryComplete")
    }
    const makeSeller = async() => {
        const repository = connection.getCustomRepository(Repository.Seller)

        for (const element in seller){
            const sellerModel = new Entity.Seller();
            sellerModel.name = element;
            sellerModel.email = seller[element]
            await repository.saveSeller(sellerModel)
        }

        console.log("makeSellerComplete")
    }
    const makeService = async() => {
        for (const element in service){
            const serviceModel = new Entity.Service();
            const serviceEventModel = new Entity.ServiceEvent();
            const serviceCategoryModel = new Entity.ServiceCategory();
            const serviceTagModel = new Entity.ServiceTag();

            const currentTime = moment.tz("Asia/Seoul");
            const standardHour = makeHour(currentTime.hours());
            const currentDate = currentTime.toDate();

            serviceEventModel.date = currentDate;
            serviceEventModel.time = standardHour;

            serviceModel.name = element;
            serviceModel.id = service[element][0];
            serviceModel.type = service[element][1];
            serviceModel.serviceLogoUrl = logourl;
            serviceModel.summary = service[element][2];
            serviceModel.seller = service[element][3];
            serviceModel.customizable = false;

            const queryRunner = connection.createQueryRunner();
            try {
                await queryRunner.startTransaction();
                await queryRunner.manager.save(serviceModel);
                
                serviceEventModel.service = service[element][0];
                await queryRunner.manager.save(serviceEventModel);
                
                for(const category of service[element][4]) {
                    serviceCategoryModel.service = service[element][0];
                    serviceCategoryModel.category = category;
                    await queryRunner.manager.save(serviceCategoryModel);
                }
    
                for(const tag of service[element][5]) {
                    serviceTagModel.service = service[element][0];
                    serviceTagModel.tag = tag;
                    await queryRunner.manager.save(serviceTagModel);
                }

                await queryRunner.commitTransaction();
            }

            catch(e) {
                    console.log(e);
                    await queryRunner.rollbackTransaction();
                }

            finally {
                await queryRunner.release();
            }
        }

        console.log("makeServiceComplete");
    }
    const makeRank = async() => {
        const eventRepository = connection.getCustomRepository(Repository.ServiceEvent)
        const rankRepository = connection.getCustomRepository(Repository.ServiceRank)

        const currentTime = moment.tz("Asia/Seoul")
        const currentHour = makeHour(currentTime.hours());
        const currentDate = currentTime.toDate();
        
        const eventModelForRank = await eventRepository.getServiceEvents(currentDate, currentHour);
        
        for (const [index, element] of eventModelForRank.entries()) {
            const serviceRankModel = new Entity.ServiceRank();
            serviceRankModel.service = element.service;
            serviceRankModel.date = currentDate;
            serviceRankModel.time = currentHour;
            serviceRankModel.rank = index+1;
            await rankRepository.saveServiceRank(serviceRankModel);
        }

        const subpingDDB = new SubpingDDB(process.env.subpingTable);
        const controller = subpingDDB.getController();

        const HotChartTimeModel: HotChartTimeModel = {
            PK: "hotChartTime",
            SK: "hotChartTime",
            createdAt: null,
            updatedAt: null,
            model: "hotChartTime",
            date: moment(currentDate).format("YYYY-MM-DD"),
            time: currentHour
        };
        await controller.create<HotChartTimeModel>(HotChartTimeModel);
        console.log("makeRankComplete")
    }
    const makeProduct = async() => {
        const repository = connection.getCustomRepository(Repository.Product);

        for (const element in product){
            const productModel = new Entity.Product();
            productModel.id = element;
            productModel.price = product[element][0];
            productModel.name = product[element][1];
            productModel.summary = product[element][2];
            productModel.productLogoUrl = logourl;
            productModel.amount = 0;
            productModel.available = product[element][3];
            productModel.service = product[element][4];
            await repository.saveProduct(productModel);
        };

        const productPeriodRepository = connection.getRepository(Entity.ProductPeriod);
        for (const element in productPeriod){
            const productPeriodModel = new Entity.ProductPeriod();
            productPeriodModel.product = element;
            productPeriodModel.period = product[element][0];
            await productPeriodRepository.save(productPeriodModel);
        };

        console.log("makeProductComplete");
    }
    const makeUser = async() => {
        const repository = connection.getCustomRepository(Repository.User)

        for (const element in user){
            const userModel = new Entity.User();
            userModel.email = element;
            userModel.name = user[element][0];
            userModel.nickName = user[element][1];
            userModel.userProfileImageUrl = userProfileImageUrl;
            userModel.birthday = user[element][2];
            userModel.gender = user[element][3];
            userModel.ci = user[element][4];
            userModel.carrier = user[element][5];
            userModel.phoneNumber = user[element][6];
            await repository.saveUser(userModel)
        }
        console.log("makeUserComplete")
    }
    const makeSubscribe = async() => {
        const subscribeRepository = connection.getCustomRepository(Repository.Subscribe);

        const currentDate = moment.tz("Asia/Seoul").toDate();

        for (const element in subscribe){
            const subscribeModel = new Entity.Subscribe();
            subscribeModel.id = element
            subscribeModel.user = subscribe[element][0];
            subscribeModel.subscribeDate = currentDate;
            subscribeModel.product = subscribe[element][1];
            subscribeModel.expiredDate = null;
            await subscribeRepository.saveSubscribe(subscribeModel);
        }

        const subscribeItemRepository = connection.getRepository(Entity.SubscirbeItem)
        for (const element in subscribeItem){
            const subscribeItemModel = new Entity.SubscirbeItem();
            subscribeItemModel.subscribe = element;
            subscribeItemModel.product = subscribeItem[element][0]
            subscribeItemModel.period = subscribeItem[element][1]
            subscribeItemModel.amount = subscribeItem[element][2]
            await subscribeItemRepository.save(subscribeItemModel)
        }

        console.log("makeSubscribeComplete");
    }
    const makeAlarm = async() => {
        const repository = connection.getCustomRepository(Repository.Alarm)

        for (const element in alarm){
            const alarmModel = new Entity.Alarm();
            alarmModel.id = element;
            alarmModel.type = alarm[element][0]
            alarmModel.title = alarm[element][1]
            alarmModel.content = alarm[element][2]
            alarmModel.read = false
            alarmModel.user = alarm[element][3]
            await repository.saveAlarm(alarmModel)
        }
        console.log("makeAlarmComplete")
    }
    const userLike = async() => {
        const userLikeRepository = connection.getCustomRepository(Repository.UserLike);

        for (const element in like){
            const userLikeEntity = new Entity.UserLike();
            userLikeEntity.service = element;
            userLikeEntity.user = like[element];
            await userLikeRepository.makeUserLike(userLikeEntity);
        };

        console.log("makeUserLikeComplete");
    }
    const makeReview = async() => {
        const reviewRepository = connection.getCustomRepository(Repository.Review);
        for (const element in review){
            const reviewModel = new Entity.Review();
            reviewModel.id = element;
            reviewModel.title = review[element][0];
            reviewModel.content = review[element][1];
            reviewModel.rating = review[element][2];
            reviewModel.user = review[element][3];
            reviewModel.product = review[element][4];
            await reviewRepository.saveReview(reviewModel);
        };
        
        const reviewImageRepository = connection.getRepository(Entity.ReviewImage)
        for (const element in reviewImage){
            const reviewImageModel = new Entity.ReviewImage();
            reviewImageModel.id = element;
            reviewImageModel.imageUrl = reviewImage[element][0];
            reviewImageModel.review = reviewImage[element][1];
            await reviewImageRepository.save(reviewImageModel)
        }
        console.log("makeReviewComplete");
    }
    try {
        await connection.synchronize();
        await makeCategory();
        await makeSeller();
        await makeService();
        await makeRank();
        await makeProduct();
        await makeUser();
        await makeSubscribe();
        await makeAlarm();
        await userLike();
        await makeReview();

        return success({
            success: true,
            message: "BackupSuccess"
        });
    } 

    catch (e) {
        console.log(e);
        return failure({
            success: false,
            message: "BackupException"
        });
    }
}