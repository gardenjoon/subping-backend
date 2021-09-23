import SubpingRDB, { Entity, Repository } from "subpingrdb";

import { APIGatewayProxyHandler } from 'aws-lambda';
import { success, failure } from "../../libs/response-lib";
import * as moment from "moment-timezone";
import { UserAddressRepository } from "subpingrdb/dist/src/repository/UserAddress";
import { UserCardRepository } from "subpingrdb/dist/src/repository/UserCard";
import { SubscribeRepository } from "subpingrdb/dist/src/repository/Subscribe";
import { ProductRepository } from "subpingrdb/dist/src/repository/Product";
import Payment from "../../libs/payment";

export const handler: APIGatewayProxyHandler = async (event, _context) => {
    try {
        const header = event.headers;
        const userId = header.id;
        const body = JSON.parse(event.body || "");
        console.log(`[makeSubscribe] 구독 요청 시작\nheader: ${header}\nbody: ${body}`);

        const { subscribeProducts, period, subscribeDate, card, address, serviceId } = body;

        const subpingRDB = new SubpingRDB();
        const connection = await subpingRDB.getConnection("dev");
        const userAddressRepository = connection.getCustomRepository(UserAddressRepository);
        const userCardRepository = connection.getCustomRepository(UserCardRepository);
        const subscribeRepository = connection.getCustomRepository(SubscribeRepository);
        const productRepository = connection.getCustomRepository(ProductRepository);

        // 해당 유저가 이미 해당 서비스를 구독하고 있는지 검증합니다.
        const userExistSubscribe = await subscribeRepository.getSubscribesByServiceId(userId, serviceId);
        console.log(userExistSubscribe);

        if (userExistSubscribe.length > 0) {
            return failure({
                success: false,
                message: "UserHasSameServiceSubscribeException"
            });
        }

        // 구독할 상품이 모두 같은 서비스의 상품이 맞는지 검증합니다.
        const productsInTargetService = await productRepository.getProducts(serviceId);
        let totalPrice = 0;
        let matchCount = 0;

        for (const productInTargetService of productsInTargetService) {
            for (const subscribeProduct of subscribeProducts) {
                if (productInTargetService.id == subscribeProduct.id) {
                    totalPrice += productInTargetService.price * subscribeProduct.amount;
                    matchCount += 1;
                }
            }
        }

        if (matchCount < subscribeProducts.length) {
            return failure({
                success: false,
                message: "ProductNotInOneServiceException"
            });
        }

        // 주소가 해당 유저의 주소가 맞는지 검증합니다.
        if (address) {
            const targetAddress = await userAddressRepository.getAddress(address);

            if (targetAddress.userId != userId) {
                return failure({
                    success: false,
                    message: "WrongAccessUserAddressException"
                })
            }
        }

        // 카드가 해당 유저의 카드가 맞는지 검증합니다.
        const targetCard = await userCardRepository.getCard(card);

        if (targetCard.userId != userId) {
            return failure({
                success: false,
                message: "WrongAccessUserCardException"
            })
        }

        const queryRunner = connection.createQueryRunner();

        try {
            // subscribe 모델을 생성합니다.
            const subscribe = new Entity.Subscribe();
            subscribe.user = userId;
            subscribe.subscribeDate = subscribeDate;
            subscribe.period = period;
            subscribe.userCard = card;
            subscribe.address = address || null;

            // 트랜젝션을 시작합니다.
            await queryRunner.startTransaction();

            const { id } = await queryRunner.manager.save(subscribe);

            // subscribe_items를 생성합니다.
            for (const subscribeProduct of subscribeProducts) {
                const subscribeItem = new Entity.SubscribeItem();
                subscribeItem.subscribe = id;
                subscribeItem.amount = subscribeProduct.amount;
                subscribeItem.product = subscribeProduct.id;

                await queryRunner.manager.save(subscribeItem);
            }

            console.log(totalPrice);

            // payment를 생성합니다.
            const payment = new Entity.Payment();
            payment.amount = totalPrice;
            payment.paymentDate = subscribeDate;
            payment.paymentComplete = false;
            payment.rewardComplete = false;
            payment.subscribe = id;

            const paymentId = (await queryRunner.manager.save(payment)).id;

            // 결제를 진행합니다.
            const iamport = new Payment();
            const paymentResponse = await iamport.pay("섭핑 구독결제", card, paymentId, totalPrice);
            console.log(paymentResponse);

            const { code, message } = paymentResponse;
            if (code === 0) { // 카드사 통신에 성공(실제 승인 성공 여부는 추가 판단이 필요함)
                if (paymentResponse.status === "paid") { //카드 정상 승인
                    await queryRunner.manager.update(Entity.Payment,
                        {
                            id: paymentId
                        },
                        {
                            paymentComplete: true
                        });
                        
                    const nextDate = Payment.calcNextPaymentDate(period, subscribeDate);

                    const nextPayment = new Entity.Payment();
                    payment.amount = 0;
                    payment.paymentDate = new Date(nextDate);
                    payment.paymentComplete = false;
                    payment.rewardComplete = false;
                    payment.subscribe = id;

                    await queryRunner.manager.save(nextPayment);
                }

                else { //카드 승인 실패 (예: 고객 카드 한도초과, 거래정지카드, 잔액부족 등)
                    //paymentResult.status : failed 로 수신됨
                }
            }

            else { // 카드사 요청에 실패 (paymentResult is null)

            }

            await queryRunner.commitTransaction();
        }

        catch (e) {
            queryRunner.rollbackTransaction();
            console.log(e);
            return failure({
                success: false,
                message: "MakeSubscribeTransactionException"
            });
        }

        finally {
            queryRunner.release();
        }


        return success({
            success: true,
            message: "MakeSubscribeSuccess"
        });

    }

    catch (e) {
        console.log(e);
        return failure({
            success: false,
            message: "MakeSubscribeException"
        });
    }
}