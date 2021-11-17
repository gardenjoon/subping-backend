import { APIGatewayProxyHandler } from 'aws-lambda';
import * as moment from 'moment-timezone';
import SubpingRDB, { Repository } from 'subpingrdb';
import { success, failure } from "../../libs/response-lib";

export const handler: APIGatewayProxyHandler = async (event, _context) => {
    try {
        const header = event.headers;
        const userId = header.id;
        const body = JSON.parse(event.body || "");

        const { subscribeId, cancel } = body;

        const subpingRDB = new SubpingRDB();
        const connection = await subpingRDB.getConnection("dev");
        const subscribeRepository = connection.getCustomRepository(Repository.Subscribe);

        const subscribe = (await subscribeRepository.querySubscribes(userId, {
            subscribeId: subscribeId,
            payment: {
                startDate: null,
                endDate: null
            }
        }))[0];

        if(subscribe) {
            if(cancel) {
                await subscribeRepository.update({
                    id: subscribe.id
                }, {
                    expiredDate: null
                });

                return success({
                    success: true,
                    message: "done"
                });
            }

            else {
                if(subscribe.userId == userId) {
                    let lastReward;
                    
                    for(const payment of subscribe.payments) {
                        if(payment.reward) {
                            lastReward = payment.reward;
                            break;
                        }
                    }
                    
                    if(lastReward) {
                        const today = moment.tz("Asia/Seoul").format("YYYY-MM-DD");
    
                        // 리워드 종료일이 오늘 보다 크거나 같을 경우 (구독 효력이 남아 있는 경우)
                        if(lastReward.endDate >= today) {
                            await subscribeRepository.update({
                                id: subscribe.id
                            }, {
                                expiredDate: moment(lastReward.endDate).add(1, "day").format("YYYY-MM-DD")
                            });
    
                            return success({
                                success: true,
                                message: "SubscribeCancelReserved"
                            });
                        }
        
                        else {
                            await subscribeRepository.delete({
                                id: subscribe.id
                            })
    
                            return success({
                                success: true,
                                message: "SubscribeCanceled"
                            });
                        }
                    } 
                    
                    else {
                        return failure({
                            success: false,
                            message: "NoRewardException"
                        });
                    }
                } 
                
                else {
                    return failure({
                        success: false,
                        message: "WrongAccessException"
                    });
                }
            }
        } 

        else {
            return failure({
                success: false,
                message: "NoSubscribeException"
            });
        }
    }

    catch (e) {
        console.log(e);
        return failure({
            success: false,
            message: "CancelSubscribeException"
        });
    }
}