import SubpingRDB, { Repository, Entity } from "subpingrdb";
import SubpingDDB from "../../libs/SubpingDDB";
import HotChartTimeModel from "../../libs/subpingddb/model/subpingTable/hotChartTime";
import * as moment from "moment-timezone";

const makeHour = (hour: Number) => {
    let standardHour:string;
    return standardHour = 
            (3 <= hour && hour < 9) ? "03:00"
        :   (9 <= hour && hour < 15) ? "09:00"
        :   (15 <= hour && hour < 21) ? "15:00"
        :   "21:00"
}
const setTime = () => {
    const time = {
        currentHour : null,
        currentDate : null
    }

    const currentTime = moment();
    time.currentHour = makeHour(currentTime.hours());
    time.currentDate = currentTime.format("YYYY-MM-DD")

    return time
}
export const handler = async (event, _context) => {
    const subpingDDB = new SubpingDDB(process.env.subpingTable);
    const controller = subpingDDB.getController();
    const subpingRDB = new SubpingRDB();
    const connection = await subpingRDB.getConnection("dev");
    
    const body = event;
    const { logourl, userProfileImageUrl, category, seller, service, product, user, userAddress, userCard, subscribe, subscribeItem, alarm, like, review, reviewImage } = body;
    
    const time = setTime()
    const deleteTable = async () => {
        await connection.query(`delete from service;`)
        await connection.query(`delete from user;`)
        console.log("deleteTableComplete")
    }
    const makeCategory = async() => {
        const repository = connection.getCustomRepository(Repository.Category);
        for (const element in category){
            const categoryModel = new Entity.Category();
            categoryModel.name = element;
            categoryModel.summary = category[element];
            categoryModel.categoryLogoUrl = null;
            await repository.saveCategory(categoryModel);
        }
        console.log("makeCategoryComplete");
    }
    const makeSeller = async() => {
        const repository = connection.getCustomRepository(Repository.Seller);

        for (const element in seller){
            const sellerModel = new Entity.Seller();
            sellerModel.id = seller[element][0]
            sellerModel.name = element;
            sellerModel.email = seller[element][1];
            await repository.saveSeller(sellerModel);
        }
        console.log("makeSellerComplete")
    }
    const makeService = async() => {
        for (const element in service){
            const serviceModel = new Entity.Service();
            const serviceEventModel = new Entity.ServiceEvent();
            const serviceRankModel = new Entity.ServiceRank();
            const serviceCategoryModel = new Entity.ServiceCategory();
            const serviceTagModel = new Entity.ServiceTag();

            serviceEventModel.date = time.currentDate;
            serviceEventModel.time = time.currentHour;

            serviceRankModel.date = time.currentDate;
            serviceRankModel.time = time.currentHour;

            const HotChartTimeModel: HotChartTimeModel = {
                PK: "hotChartTime",
                SK: "hotChartTime",
                createdAt: null,
                updatedAt: null,
                model: "hotChartTime",
                date: time.currentDate,
                time: time.currentHour
            };

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

                serviceRankModel.service = service[element][0]
                serviceRankModel.rank = service[element][7]
                await queryRunner.manager.save(serviceRankModel)

                await controller.create<HotChartTimeModel>(HotChartTimeModel);
                
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
    const makeServicePeriod = async() => {
        const servicePeriodRepository = connection.getRepository(Entity.ServicePeriod);

        for (const element in service){
            for (const servicePeriod of service[element][6][0]) {
                const servicePeriodModel = new Entity.ServicePeriod();
                servicePeriodModel.service = service[element][0];
                servicePeriodModel.period = servicePeriod;
                servicePeriodModel.default = (servicePeriod == service[element][6][1]) ? true : false;
                await servicePeriodRepository.save(servicePeriodModel);
            }
        }

        console.log("makeServicePeriodComplete");
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
            productModel.available = product[element][3];
            productModel.service = product[element][4];
            await repository.saveProduct(productModel);
        };

        console.log("makeProductComplete");
    }
    const makeUser = async() => {
        const repository = connection.getCustomRepository(Repository.User)

        for (const element in user){
            const userModel = new Entity.User();
            userModel.id = element
            userModel.email = user[element][0];
            userModel.name = user[element][1];
            userModel.nickName = user[element][2];
            userModel.userProfileImageUrl = userProfileImageUrl;
            userModel.birthday = user[element][3];
            userModel.gender = user[element][4];
            userModel.ci = user[element][5];
            userModel.carrier = user[element][6];
            userModel.phoneNumber = user[element][7];
            await repository.saveUser(userModel);
        }
        console.log("makeUserComplete");
    }
    const makeUserAddress = async() => {
        const userAddressRepository = connection.getRepository(Entity.UserAddress)

        for (const address in userAddress) {
            const addressModel = new Entity.UserAddress();
            addressModel.id = address
            addressModel.user = userAddress[address][0];
            addressModel.userName = userAddress[address][1];
            addressModel.userPhoneNumber = userAddress[address][2];
            addressModel.postCode = userAddress[address][3];
            addressModel.address = userAddress[address][4];
            addressModel.detailedAddress = userAddress[address][5];
            addressModel.isDefault = userAddress[address][6];
            await userAddressRepository.save(addressModel)
        }

        console.log("makeUserAddressComplete")
    }
    const makeSubscribe = async() => {
        const subscribeRepository = connection.getRepository(Entity.Subscribe);
        const subscribeItemRepository = connection.getRepository(Entity.SubscribeItem);

        const currentDate = new Date();

        for (const element in subscribe){
            const subscribeModel = new Entity.Subscribe();
            subscribeModel.id = element;
            subscribeModel.user = subscribe[element][0];
            subscribeModel.subscribeDate = currentDate;
            subscribeModel.expiredDate = null;
            subscribeModel.reSubscribeDate = null;
            subscribeModel.period = subscribe[element][1]
            await subscribeRepository.save(subscribeModel);
        }

        for(const element in subscribeItem) {
            const subscribeItemModel = new Entity.SubscribeItem();
            subscribeItemModel.id = element;
            subscribeItemModel.subscribe = subscribeItem[element][0];
            subscribeItemModel.product = subscribeItem[element][1];
            subscribeItemModel.amount = subscribeItem[element][2];
            await subscribeItemRepository.save(subscribeItemModel);
        }

        console.log("makeSubscribeComplete");
    }
    const makeAlarm = async() => {
        const repository = connection.getCustomRepository(Repository.Alarm);

        for (const element in alarm){
            const alarmModel = new Entity.Alarm();
            alarmModel.id = element;
            alarmModel.type = alarm[element][0];
            alarmModel.title = alarm[element][1];
            alarmModel.content = alarm[element][2];
            alarmModel.read = false;
            alarmModel.user = alarm[element][3];
            await repository.saveAlarm(alarmModel);
        }
        console.log("makeAlarmComplete");
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
            reviewModel.service = review[element][4];
            await reviewRepository.saveReview(reviewModel);
        };
        
        const reviewImageRepository = connection.getRepository(Entity.ReviewImage);
        for (const element in reviewImage){
            const reviewImageModel = new Entity.ReviewImage();
            reviewImageModel.id = element;
            reviewImageModel.imageUrl = reviewImage[element][0];
            reviewImageModel.review = reviewImage[element][1];
            await reviewImageRepository.save(reviewImageModel);
        }
        console.log("makeReviewComplete");
    }
    const makeUserCard = async() => {
        const userCardRepository = connection.getRepository(Entity.UserCard);
        for (const element in userCard) {
            const userCardModel = new Entity.UserCard();
            userCardModel.id = element;
            userCardModel.cardVendor = userCard[element][0]
            userCardModel.cardName = userCard[element][1]
            userCardModel.billingKey = userCard[element][2]
            userCardModel.pg = userCard[element][3]
            userCardModel.method = userCard[element][4]
            userCardModel.user = userCard[element][5];
            await userCardRepository.save(userCardModel)
        }
        console.log("makeUserCardComplete")
    }
    try {
        await deleteTable();
        await connection.synchronize();
        await makeCategory();
        await makeSeller();
        await makeService();
        await makeServicePeriod();
        await makeProduct();
        // await makeSubscribe();
        await makeUser();
        await makeUserAddress();
        await makeAlarm();
        await userLike();
        await makeReview();
        await makeUserCard();

        return console.log("BackupSuccess!!!!!!!!")
    } 

    catch (e) {
        console.log(e);
        return console.log("NOOooooooo.....")
    }
}