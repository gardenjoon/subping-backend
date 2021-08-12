import SubpingRDB, { Repository, Entity } from "subpingrdb";
import  * as moment from "moment-timezone";

import { APIGatewayProxyHandler } from 'aws-lambda';
import { success, failure } from "../../libs/response-lib";

export const handler: APIGatewayProxyHandler = async (event, _context) => {
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
        const subpingRDB = new SubpingRDB();
        const connection = await subpingRDB.getConnection("dev");
        const repository = connection.getCustomRepository(Repository.Category)
        const backupData = {
            "사회" : "정치, 뉴스 등에 관한 카테고리입니다",
            "미디어" : "영화, 드라마 등에 관한 카테고리입니다",
            "식품" : "음식, 주류 등에 관한 카테고리입니다"
        }
        for (const element in backupData){
            const categoryModel = new Entity.Category();
            categoryModel.name = element
            categoryModel.summary = backupData[element]
            categoryModel.categoryLogoUrl = null
            await repository.saveCategory(categoryModel)
        }
        console.log("makeCategoryComplete")
    }
    const makeSeller = async() => {
        const subpingRDB = new SubpingRDB();
        const connection = await subpingRDB.getConnection("dev");
        const repository = connection.getCustomRepository(Repository.Seller)
        const backupData = {
            "정원준" : "wonjoon@joiple.co",
            "정승우" : "seungwoo@joiple.co"
        }
        for (const element in backupData){
            const sellerModel = new Entity.Seller();
            sellerModel.name = element;
            sellerModel.email = backupData[element]
            await repository.saveSeller(sellerModel)
        }
        console.log("makeSellerComplete")
    }
    const makeService = async() => {
        const subpingRDB = new SubpingRDB();
        const connection = await subpingRDB.getConnection("dev");
        const backupData = {
            "넷플릭스" : ["35f6a231-4832-49dc-be76-c8241ebb8135","online","https://subping-assets.s3.ap-northeast-2.amazonaws.com/serviceLogo/watcha.png","전세계 모든 미디어를 한곳에서!","wonjoon@joiple.co",["미디어"],["영화", "드라마"]],
            "왓챠" : ["4dd6a155-be2e-4ca3-b3b0-6e044d5766dd	","online","https://subping-assets.s3.ap-northeast-2.amazonaws.com/serviceLogo/watcha.png","국내외 영화, 드라마를 한곳에서","wonjoon@joiple.co",["미디어"],["영화","드라마"]],
            "부산일보": ["87a8fa90-a720-43f7-9fdc-7e7bab2721cf	", "delivery", "https://subping-assets.s3.ap-northeast-2.amazonaws.com/serviceLogo/watcha.png", "부산에서 무슨일이 일어날까요","wonjoon@joiple.co",["사회"],["뉴스","신문"]],
            "술담화": ["bb1f2016-7945-44cc-a6b1-0f0ad152cdb2	", "delivery", "https://subping-assets.s3.ap-northeast-2.amazonaws.com/serviceLogo/watcha.png", "매달 다른 술을 배송해드릴게요 😀","wonjoon@joiple.co",["식품"],["주류","전통주"]],
        }
        for (const element in backupData){
            const serviceModel = new Entity.Service();
            const serviceEventModel = new Entity.ServiceEvent();
            const serviceCategoryModel = new Entity.ServiceCategory();
            const serviceTagModel = new Entity.ServiceTag();

            const currentTime = moment.tz("Asia/Seoul");
            const standardHour = makeHour(currentTime.hours());
            const currentDate = currentTime.format("YYYY-MM-DD");

            serviceEventModel.date = currentDate
            serviceEventModel.time = standardHour;

            serviceModel.name = element;
            serviceModel.id = backupData[element][0]
            serviceModel.type = backupData[element][1]
            serviceModel.serviceLogoUrl = backupData[element][2]
            serviceModel.summary = backupData[element][3]
            serviceModel.seller = backupData[element][4]

            const queryRunner = connection.createQueryRunner();
            try {
                await queryRunner.startTransaction();
                await queryRunner.manager.save(serviceModel);
                
                serviceEventModel.service = backupData[element][0];
                await queryRunner.manager.save(serviceEventModel);
                
                for(const category of backupData[element][5]) {
                    serviceCategoryModel.service = backupData[element][0];
                    serviceCategoryModel.category = category;
                    await queryRunner.manager.save(serviceCategoryModel);
                }
    
                for(const tag of backupData[element][6]) {
                    serviceTagModel.service = backupData[element][0];
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
        console.log("makeServiceComplete")
    }
    const makeProduct = async() => {
        const subpingRDB = new SubpingRDB();
        const connection = await subpingRDB.getConnection("dev");
        const repository = connection.getCustomRepository(Repository.Product)
        const logourl = "https://subping-assets.s3.ap-northeast-2.amazonaws.com/serviceLogo/watcha.png"
        const backupData = {
            "28864f6c-44c7-4dc9-9bce-e81d1b173aa9" : ["14500","Premium","넷플릭스 프리미엄 요금제 입니다.",logourl,true,"35f6a231-4832-49dc-be76-c8241ebb8135"],
            "3c1ba7ea-33e1-4271-9ae9-46e3165c011c" : ["9500","Basic","넷플릭스 베이직 요금제 입니다.",logourl,true,"35f6a231-4832-49dc-be76-c8241ebb8135"],
            "4d23346f-f14d-4a4e-be77-f1f254ec250d" : ["12000","Standard","넷플릭스 스탠다드 요금제 입니다.",logourl,true,"35f6a231-4832-49dc-be76-c8241ebb8135"],
            "a0f4ea49-223a-49c7-b076-c2f06055c22a" : ["12900","Premium","왓챠 프리미엄 요금제 입니다.",logourl,true,"4dd6a155-be2e-4ca3-b3b0-6e044d5766dd"],
            "b3bda359-df7c-4615-bb7e-b8a1e0c43887" : ["4900","Basic","왓챠 베이직 요금제 입니다.",logourl,true,"4dd6a155-be2e-4ca3-b3b0-6e044d5766dd"],
        }
        for (const element in backupData){
            const productModel = new Entity.Product();
            productModel.id = element;
            productModel.price = backupData[element][0]
            productModel.name = backupData[element][1]
            productModel.summary = backupData[element][2]
            productModel.productLogoUrl = backupData[element][3]
            productModel.available = backupData[element][4]
            productModel.service = backupData[element][5]
            await repository.saveProduct(productModel)
        }
        console.log("makeProductComplete")
    }
    const makeUser = async() => {
        const subpingRDB = new SubpingRDB();
        const connection = await subpingRDB.getConnection("dev");
        const repository = connection.getCustomRepository(Repository.User)
        const backupData = {
            "dlwjdwls6504@gmail.com" : ["이정진",null,null,"1998-09-02","M","testCI","SKT","01050362687"],
            "jsw9808@gmail.com" : ["정승우",null,null,"1998-08-03","M","testCI","SKT","01088812173"],
            "qkrrhkddl7@naver.com" : ["박광이",null,null,"1998-08-03","M","testCI","SKT","01099481351"],
        }
        for (const user in backupData){
            const userModel = new Entity.User();
            userModel.email = user;
            userModel.name = backupData[user][0];
            userModel.nickName = backupData[user][1];
            userModel.userProfileImageUrl = backupData[user][2];
            userModel.birthday = backupData[user][3];
            userModel.gender = backupData[user][4];
            userModel.ci = backupData[user][5];
            userModel.carrier = backupData[user][6];
            userModel.phoneNumber = backupData[user][7];
            await repository.saveUser(userModel)
        }
        console.log("makeUserComplete")
    }
    const makeSubscribe = async() => {
        const subpingRDB = new SubpingRDB();
        const connection = await subpingRDB.getConnection("dev");
        const subscribeRP = connection.getCustomRepository(Repository.Subscribe)
        const currentTime = moment.tz("Asia/Seoul");
        const currentDate = currentTime.format("YYYY-MM-DD");
        const backupData = {
            "dlwjdwls6504@gmail.com" : [30,currentDate,"b3bda359-df7c-4615-bb7e-b8a1e0c43887"],
            "jsw9808@gmail.com" : [30,currentDate,"28864f6c-44c7-4dc9-9bce-e81d1b173aa9"],
            "qkrrhkddl7@naver.com" : [30,currentDate,"a0f4ea49-223a-49c7-b076-c2f06055c22a"]
        }
        for (const element in backupData){
            const subscribeModel = new Entity.Subscribe();
            subscribeModel.user = element;
            subscribeModel.period = backupData[element][0];
            subscribeModel.subscribeDate = backupData[element][1];
            subscribeModel.product = backupData[element][2];
            subscribeModel.expiredDate = null;
            await subscribeRP.saveSubscribe(subscribeModel);
        }
        console.log("makeSubscribeComplete")
    }
    const makeAlarm = async() => {
        const subpingRDB = new SubpingRDB();
        const connection = await subpingRDB.getConnection("dev");
        const repository = connection.getCustomRepository(Repository.Alarm)
        const backupData = {
            "051d4419-48f1-4a59-a6c2-8eeaae90ad05" : ["info","이정진 전용","Info Message",true,"dlwjdwls6504@gmail.com"],
            "146c6a92-a032-43f6-8616-f7563292dde1" : ["delivery","이정진 전용","Delivery Message",true,"dlwjdwls6504@gmail.com"],
            "2118a203-7eaa-4cdc-a261-67c9cfb5b229" : ["payment","이정진 전용","Payment Message",true,"dlwjdwls6504@gmail.com"],
            "253ec1a1-29b9-4836-84b7-33bccb469ae2" : ["important","정승우","Important Message",true,"jsw9808@gmail.com"],
            "6b21c1c7-9548-4813-82cc-72b1d546baf1" : ["expiration","이정진 전용","Expriration Message",true,"dlwjdwls6504@gmail.com"],
        }
        for (const element in backupData){
            const alarmModel = new Entity.Alarm();
            alarmModel.id = element;
            alarmModel.type = backupData[element][0]
            alarmModel.title = backupData[element][1]
            alarmModel.content = backupData[element][2]
            alarmModel.read = backupData[element][3]
            alarmModel.user = backupData[element][4]
            await repository.saveAlarm(alarmModel)
        }
        console.log("makeAlarmComplete")
    }
    try {
        const subpingRDB = new SubpingRDB();
        const connection = await subpingRDB.getConnection("dev");
        await connection.synchronize();
        await makeCategory();
        await makeSeller();
        await makeService();
        await makeProduct();
        await makeUser();
        await makeSubscribe();
        await makeAlarm();

        return success({
            success: true,
            message: "BackupSuccess"
        })
    } 

    catch (e) {
        console.log(e);
        return failure({
            success: false,
            message: "BackupException"
        })
    }
}