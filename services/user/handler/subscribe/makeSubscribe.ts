import SubpingRDB, { Entity, Repository } from "subpingrdb";
import { IncomingWebhook } from "@slack/webhook";

import { APIGatewayProxyHandler } from 'aws-lambda';
import { success, failure } from "../../libs/response-lib";
import { UserAddressRepository } from "subpingrdb/dist/src/repository/UserAddress";
import { UserCardRepository } from "subpingrdb/dist/src/repository/UserCard";
import { SubscribeRepository } from "subpingrdb/dist/src/repository/Subscribe";
import { ProductRepository } from "subpingrdb/dist/src/repository/Product";
import SubpingPayment from "../../libs/subpingPayment";

export const handler: APIGatewayProxyHandler = async (event, _context) => {
    const webhook = new IncomingWebhook("https://hooks.slack.com/services/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");
    
    try {
        const header = event.headers;
        const userId = header.id;
        const body = JSON.parse(event.body || "");
        console.log(`[makeSubscribe] 구독 요청 시작\nheader: ${JSON.stringify(header)}\nbody: ${JSON.stringify(body)}`);

        const { subscribeProducts, period, subscribeDate, card, address, serviceId, deliveryMemo, serviceName } = body;

        const subpingRDB = new SubpingRDB();
        const connection = await subpingRDB.getConnection("dev");
        const userAddressRepository = connection.getCustomRepository(UserAddressRepository);
        const userCardRepository = connection.getCustomRepository(UserCardRepository);
        const subscribeRepository = connection.getCustomRepository(SubscribeRepository);
        const productRepository = connection.getCustomRepository(ProductRepository);

        // 해당 유저가 이미 해당 서비스를 구독하고 있는지 검증합니다.
        const userExistSubscribe = await subscribeRepository.querySubscribesByServiceId(userId, serviceId);

        if (userExistSubscribe) {
            console.log(`[makeSubscribe] 구독 요청 실패 - 중복 구독 오류`);
            return failure({
                success: false,
                message: "UserHasSameServiceSubscribeException"
            });
        }

        // 구독할 상품이 모두 같은 서비스의 상품이 맞는지 검증합니다.
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
        }

        // 카드가 해당 유저의 카드가 맞는지 검증합니다.
        const targetCard = await userCardRepository.queryUserCard(card);

        if (targetCard.userId != userId) {
            console.log(`[makeSubscribe] 구독 요청 실패 - 카드 사용자 오류`);
            return failure({
                success: false,
                message: "WrongAccessUserCardException"
            })
        }

        const queryRunner = connection.createQueryRunner();

        const user = new Entity.User();
        const subscribe = new Entity.Subscribe();
        const payment = new Entity.Payment();
        const userAddress = new Entity.UserAddress();

        try {
            user.id = userId;
            userAddress.id = address;

            // subscribe 모델을 생성합니다.
            subscribe.user = user;
            subscribe.subscribeDate = subscribeDate;
            subscribe.period = period;
            subscribe.userCard = card;
            subscribe.address = address ? userAddress : null;
            subscribe.deliveryMemo = deliveryMemo;

            // 트랜젝션을 시작합니다.
            await queryRunner.startTransaction();

            await queryRunner.manager.save(subscribe);

            // subscribe_items를 생성합니다.
            for (const subscribeProduct of subscribeProducts) {
                const subscribeItem = new Entity.SubscribeItem();
                subscribeItem.subscribe = subscribe;
                subscribeItem.amount = subscribeProduct.amount;
                subscribeItem.product = subscribeProduct.id;
                
                await queryRunner.manager.save(subscribeItem);
            }

            // payment를 생성합니다.
            payment.amount = 0;
            payment.paymentDate = subscribeDate;
            payment.paymentComplete = false;
            payment.rewardComplete = false;
            payment.paymentFailure = false;
            payment.subscribe = subscribe;
            
            await queryRunner.manager.save(payment);
            await queryRunner.commitTransaction();
        }

        catch (e) {
            await queryRunner.rollbackTransaction();
            await queryRunner.release();
            
            await webhook.send({
                text: 
`[구독 실패 알림]
사유 : DB 에러
에러 : ${e}
`}).catch(_ => {});

            console.log(`[makeSubscribe] 구독 요청 실패 - DB 생성 오류`);
            console.log(e);

            return failure({
                success: false,
                message: "MakeSubscribeException"
            });
        }

        finally {
            await queryRunner.release();
        }

        try {
            // 결제를 진행합니다.
            const subpingPayment = new SubpingPayment();
            const result = await subpingPayment.pay(payment);

            if(!result.success) {
                throw new Error(`PaymentException`);
            }
        } catch(e) {
            await subscribeRepository.delete({ id: subscribe.id });
            
            console.log(`[makeSubscribe] 구독 요청 실패 - 결제 오류`);
            
            await webhook.send({
                text: 
`[구독 실패 알림]
사유 : 결제 에러
에러 : ${e}
`}).catch(_ => {});

            return failure({
                success: false,
                message: "PaymentException"
            })
        }
        
        await webhook.send({
            text: 
`[신규 구독 알림] 🎉
구독 id : ${subscribe.id} 
서비스 : ${serviceName}
`}).catch(_ => {});

        return success({
            success: true,
            message: "MakeSubscribeSuccess"
        });

    }

    catch (e) {
        console.log(e);
        
        await webhook.send({
            text: 
`[구독 실패 알림]
사유 : 기타 에러
에러 : ${e}
`}).catch(_ => {});

        return failure({
            success: false,
            message: "MakeSubscribeException"
        });
    }
}