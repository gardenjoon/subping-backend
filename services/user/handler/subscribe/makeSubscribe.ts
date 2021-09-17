import SubpingRDB, { Entity, Repository } from "subpingrdb";

import { APIGatewayProxyHandler } from 'aws-lambda';
import { success, failure } from "../../libs/response-lib";
import * as moment from "moment-timezone";
import { UserAddressRepository } from "subpingrdb/dist/src/repository/UserAddress";
import { UserCardRepository } from "subpingrdb/dist/src/repository/UserCard";
import { SubscribeRepository } from "subpingrdb/dist/src/repository/Subscribe";
import { ProductRepository } from "subpingrdb/dist/src/repository/Product";

export const handler: APIGatewayProxyHandler = async (event, _context) => {
    try {
        const header = event.headers;
        const userId = header.id;
        const body = JSON.parse(event.body || "");

        /* 
            body: {
                susbscibeProducts: [
                    {id: "asdasd", amount: 1}
                ],
                period: "1M",
                subscribeDate: "2020-02-91",
                expiredDate: null,
                reSubscribeDate: null,
                payment: "Asdadad",
            }
        */
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

        if(userExistSubscribe.length > 0) {
            return failure({
                success: false,
                message: "UserHasSameServiceSubscribeException"
            });
        }

        // 구독할 상품이 모두 같은 서비스의 상품이 맞는지 검증합니다.
        const productsInTargetService = await productRepository.getProducts(serviceId);
        const productIdsInTargetService = [];

        productsInTargetService.map(value => {
            productIdsInTargetService.push(value.id);
        })

        subscribeProducts.map(value => {
            if(!productIdsInTargetService.includes(value.id)) {
                return failure({
                    success: false,
                    message: "ProductNotInOneServiceException"
                })
            }
        });

        // 주소가 해당 유저의 주소가 맞는지 검증합니다.
        if(address) {
            const targetAddress = await userAddressRepository.getAddress(address);
            
            if(targetAddress.userId != userId) {
                return failure({
                    success: false,
                    message: "WrongAccessUserAddressException"
                })
            }
        }

        // 카드가 해당 유저의 카드가 맞는지 검증합니다.
        const targetCard = await userCardRepository.getCard(card);
        
        if(targetCard.userId != userId) {
            return failure({
                success: false,
                message: "WrongAccessUserCardException"
            }) 
        }
        
        const queryRunner = connection.createQueryRunner();
        
        try {
            const subscribe = new Entity.Subscribe();
            subscribe.user = userId;
            subscribe.subscribeDate = subscribeDate;
            subscribe.period = period;
            subscribe.userCard = card;

            await queryRunner.startTransaction();

            const { id } = await queryRunner.manager.save(subscribe);

            for (const subscribeProduct of subscribeProducts) {
                const subscribeItem = new Entity.SubscribeItem();
                subscribeItem.subscribe = id;
                subscribeItem.amount = subscribeProduct.amount;
                subscribeItem.product = subscribeProduct.id;

                await queryRunner.manager.save(subscribeItem);
            }

            await queryRunner.commitTransaction();
        } catch (e) {
            queryRunner.rollbackTransaction();
            console.log(e);
            return failure({
                success: false,
                message: "MakeSubscribeTransactionException"
            });
        } finally {
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