import { APIGatewayProxyHandler } from "aws-lambda";
import SubpingRDB, { Entity, Repository } from "subpingrdb";
import { success, failure } from "../../libs/response-lib";
import SubpingPayment from "../../libs/subpingPayment";


export const handler: APIGatewayProxyHandler = async (event, _context) => {
    try {
        const header = event.headers;
        const userId = header.id;
        const body = JSON.parse(event.body || "");

        const { subscribeId, serviceId, subscribeProducts, period, card, address, deliveryMemo, cancelProductChange } = body;
        const subpingRDB = new SubpingRDB();
        const connection = await subpingRDB.getConnection("dev");
        const productRepository = connection.getCustomRepository(Repository.Product);
        const userCardRepository = connection.getCustomRepository(Repository.UserCard);
        const userAddressRepository = connection.getCustomRepository(Repository.UserAddress);
        const serviceRepository = connection.getCustomRepository(Repository.Service);

        const updateStatement = {};

        // 주소가 해당 유저의 주소가 맞는지 검증합니다.
        if (address) {
            const targetAddress = await userAddressRepository.queryUserAddress(address);

            if (targetAddress.userId != userId) {
                console.log(`[makeSubscribe] 구독 요청 실패 - 주소 사용자 오류`);
                return failure({
                    success: false,
                    message: "WrongAccessUserAddressException"
                })
            }
            
            const addressModel = new Entity.UserAddress();
            addressModel.id = address;

            updateStatement["address"] = addressModel
        }

        // 주가기 입력 가능한 주기인지 확인합니다.
        if (period) {
            const service = await serviceRepository.queryServices({
                period: true,
                filter: {
                    serviceId: serviceId
                }
            });

            if(!service[0].period.includes(period)) {
                console.log(`[makeSubscribe] 구독 요청 실패 - 주기 구성 오류`);
                return failure({
                    success: false,
                    message: "PeriodNotExistException"
                }); 
            }

            updateStatement["period"] = period;
        }

        // 카드가 해당 유저의 카드가 맞는지 검증합니다.
        if (card) {
            const targetCard = await userCardRepository.queryUserCard(card);

            if (targetCard.userId != userId) {
                console.log(`[makeSubscribe] 구독 요청 실패 - 카드 사용자 오류`);
                return failure({
                    success: false,
                    message: "WrongAccessUserCardException"
                })
            }

            updateStatement['userCard'] = card;
        }

        if(deliveryMemo) {
            updateStatement['deliveryMemo'] = deliveryMemo;
        }

        // 업데이트 반영
        if (card || address || period) {
            const queryRunner = connection.createQueryRunner();

            const subscribeModel = new Entity.Subscribe();
            subscribeModel.id = subscribeId;
            
            try {
                await queryRunner.startTransaction();
                
                await queryRunner.manager.update(Entity.Subscribe, {
                    id: subscribeId
                }, updateStatement);

                if(period) {
                    const payments = await queryRunner.manager.createQueryBuilder()
                        .select("*")
                        .from(Entity.Payment, "payment")
                        .where(`payment.subscribe = "${subscribeId}"`)
                        .orderBy("payment.paymentDate", "DESC")
                        .limit(2)
                        .getRawMany(); 
                    
                    const lastPaymentDate = payments[1].paymentDate
                    const nextPaymentDate = SubpingPayment.calcNextPaymentDate(period, lastPaymentDate);
                    
                    await queryRunner.manager.update(Entity.Payment, {
                        id: payments[0].id
                    }, {
                        paymentDate: nextPaymentDate
                    })
                }

                await queryRunner.commitTransaction();
            } catch(e) {
                await queryRunner.rollbackTransaction();
                await queryRunner.release();

                return failure({
                    success: false,
                    message: "UpdateSubscribeDBException"
                });
            } finally {
                await queryRunner.release();
            }
        }

        // 구독할 상품이 모두 같은 서비스의 상품이 맞는지 검증합니다.
        if (subscribeProducts) {
            const productsInTargetService = await productRepository.queryProducts(serviceId);
            let matchCount = 0;

            for (const productInTargetService of productsInTargetService) {
                for (const subscribeProduct of subscribeProducts) {
                    if (productInTargetService.id == subscribeProduct.id) {
                        matchCount += 1;
                    }
                }
            }

            if (matchCount < subscribeProducts.length) {
                console.log(`[makeSubscribe] 구독 요청 실패 - 상품 구성 오류`);
                return failure({
                    success: false,
                    message: "ProductNotInOneServiceException"
                });
            }  

            const queryRunner = connection.createQueryRunner();

            const subscribeModel = new Entity.Subscribe();
            subscribeModel.id = subscribeId;

            const subscribeItemModel = new Entity.SubscribeItem();
            subscribeItemModel.subscribe = subscribeModel;
            
            try {
                await queryRunner.startTransaction();
                
                await queryRunner.manager.delete(Entity.SubscribeItem, {
                    subscribe: subscribeModel,
                    reserved: true
                });

                for (const subscribeProduct of subscribeProducts) {
                    const subscribeItem = new Entity.SubscribeItem();
                    subscribeItem.subscribe = subscribeModel;
                    subscribeItem.amount = subscribeProduct.amount;
                    subscribeItem.product = subscribeProduct.id;
                    subscribeItem.reserved = true;
                    
                    await queryRunner.manager.save(subscribeItem);
                }
    
                await queryRunner.commitTransaction();
            } catch(e) {
                await queryRunner.rollbackTransaction();
                await queryRunner.release();

                console.log(`[updateSubscribe] 구독 변경 실패 - DB 생성 오류`);
                console.log(e);

                return failure({
                    success: false,
                    message: "MakeSubscribeItemExcpetion"
                })
            } finally {
                await queryRunner.release();
            }
        }

        if (cancelProductChange) {
            const queryRunner = connection.createQueryRunner();

            try {
                const subscribeModel = new Entity.Subscribe();
                subscribeModel.id = subscribeId;

                await queryRunner.startTransaction();
                    
                await queryRunner.manager.delete(Entity.SubscribeItem, {
                    subscribe: subscribeModel,
                    reserved: true
                });

                await queryRunner.commitTransaction();
            }
            
            catch(e) {
                await queryRunner.rollbackTransaction();
                await queryRunner.release();
                
                console.log(`[updateSubscribe] 구독 변경 실패 - DB 제거 오류`);
                console.log(e);

                return failure({
                    success: false,
                    message: "DeleteSubscribeItemExcpetion"
                })
            } finally {
                await queryRunner.release();
            }
        }

        return success({
            success: true,
            message: "success"
        })
    }

    catch(e) {
        return failure({
            success: false,
            message: "UpdateSubscribeExeption"
        })
    }
}