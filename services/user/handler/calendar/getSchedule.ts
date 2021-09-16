import { APIGatewayProxyHandler } from 'aws-lambda';
import SubpingRDB, { Repository } from "subpingrdb";
import * as moment from "moment-timezone";

import { success, failure } from "../../libs/response-lib";

export const handler: APIGatewayProxyHandler = async (event, _context) => {
    try {
        const result = {};

        // const userId = event.headers.id;
        const userId = "jsw9808@gmail.com";
        const subpingRDB = new SubpingRDB()
        const connection = await subpingRDB.getConnection("dev");
        const subscribeRepository = connection.getCustomRepository(Repository.Subscribe)
        const subscribes = await subscribeRepository.getSubscribes(userId);

        const currentMoment = moment.tz("Asia/Seoul")
            .hour(0)
            .minute(0)
            .second(0)
            .millisecond(0);
        const startMoment = moment(currentMoment)
            .subtract(1, "M")
            .startOf("M")
        const endMoment = moment(currentMoment)
            .add(1,"M")
            .endOf("M")
        
        for(const subscribe of subscribes) {
            const { subscribeDate, expiredDate, period, summary, name, price, id, productLogoUrl } = subscribe;
            const subscribeMoment = moment(subscribeDate);
            
            // 이미 만료된 구독이라면
            if(expiredDate && moment(expiredDate).isBefore(startMoment)) {
                continue;
            }

            // 구독한 날짜가 캘린더에 표시되는 날짜 안에 있으면
            if(subscribeMoment.isBetween(startMoment, endMoment, null, "[]")) {
                const subscribeMomentString = subscribeMoment.toString();

                if(Object.keys(result).includes(subscribeMomentString)) {
                    console.log(subscribe);
                }

                else {
                    console.log(subscribe);
                }
            }

            // 구독한 날짜가 캘린더에 표지되는 날짜 이전이라면
            else {

            }
        }
        
        return success({
            success: true,
            message: result
        });
    }

    catch (e) {
        console.log(e);
        return failure({
            success: false,
            message: "GetScheduleException"
        })
    }
}
