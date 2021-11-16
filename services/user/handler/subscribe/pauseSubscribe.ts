import { APIGatewayProxyHandler } from 'aws-lambda';
import * as moment from 'moment';
import SubpingRDB, { Entity, Repository } from 'subpingrdb';
import { success, failure } from "../../libs/response-lib";
import SubpingPayment from '../../libs/subpingPayment';

export const handler: APIGatewayProxyHandler = async (event, _context) => {
    try {
        const header = event.headers;
        const userId = header.id;
        const body = JSON.parse(event.body || "");

        const { subscribeId, pauseTimes, cancelPause } = body;

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

        if (subscribe) {
            if (cancelPause) {
                const today = moment().tz("Asia/Seoul").format("YYYY-MM-DD")
                const reservedPayment = subscribe.payments[0];
                const lastPaidPayment = subscribe.payments[1];
                const originalReservedPaymentDate = SubpingPayment.calcNextPaymentDate(subscribe.period, lastPaidPayment.paymentDate.toString());

                const queryRunner = connection.createQueryRunner();

                // 취소일이 원래 갱신되어야 하는 날짜보다 이를 때
                if (originalReservedPaymentDate > today) {
                    await queryRunner.startTransaction();

                    try {
                        await queryRunner.manager.update(Entity.Subscribe, {
                            id: subscribe.id
                        }, {
                            reSubscribeDate: null
                        });

                        await queryRunner.manager.update(Entity.Payment, {
                            id: reservedPayment.id
                        }, {
                            paymentDate: originalReservedPaymentDate
                        });

                        await queryRunner.commitTransaction();
                    }

                    catch (e) {
                        await queryRunner.rollbackTransaction();
                        await queryRunner.release();

                        return failure({
                            success: false,
                            message: "DBException"
                        })
                    }

                    finally {
                        await queryRunner.release();
                    }
                }

                // 취소일이 원래 갱신되어야 하는 날짜보다 늦을 때 -> 바로 갱신
                else {
                    await queryRunner.startTransaction();

                    try {
                        await queryRunner.manager.update(Entity.Subscribe, {
                            id: subscribe.id
                        }, {
                            reSubscribeDate: null
                        });

                        await queryRunner.manager.update(Entity.Payment, {
                            id: reservedPayment.id
                        }, {
                            paymentDate: today
                        });
                        await queryRunner.commitTransaction();
                    }

                    catch (e) {
                        await queryRunner.rollbackTransaction();
                        await queryRunner.release();

                        return failure({
                            success: false,
                            message: "DBException"
                        })
                    }

                    finally {
                        await queryRunner.release();
                    }

                    try {
                        // 결제를 진행합니다.
                        const subpingPayment = new SubpingPayment();
                        const result = await subpingPayment.pay(reservedPayment);

                        if (!result.success) {
                            throw new Error(`PaymentException`);
                        }
                    } catch (e) {
                        await subscribeRepository.delete({ id: subscribe.id });

                        console.log(`[makeSubscribe] 구독 요청 실패 - 결제 오류`);

                        return failure({
                            success: false,
                            message: "PaymentException"
                        })
                    }
                }

                return success({
                    success: true,
                    message: "done"
                });
            } else {
                if (subscribe.reSubscribeDate != null) {
                    return failure({
                        success: false,
                        message: "AlreadyPausedException"
                    })
                }

                if (subscribe.userId == userId) {
                    // 만약 마지막 payment가 예약된 것이 아니면 재구독에 실패한 케이스
                    const isReservedPayment = (!subscribe.payments[0].paymentFailure && !subscribe.payments[0].paymentComplete)

                    if (isReservedPayment) {
                        const reservedPayment = subscribe.payments[0];
                        const reservedPaymentDate = reservedPayment.paymentDate;
                        let nextPaymentDate = reservedPaymentDate.toString();

                        for (let _ = 0; _ < pauseTimes; _++) {
                            nextPaymentDate = SubpingPayment.calcNextPaymentDate(subscribe.period, nextPaymentDate)
                        }

                        const queryRunner = connection.createQueryRunner();

                        await queryRunner.startTransaction();

                        try {
                            await queryRunner.manager.update(Entity.Subscribe, {
                                id: subscribe.id
                            }, {
                                reSubscribeDate: nextPaymentDate
                            });

                            await queryRunner.manager.update(Entity.Payment, {
                                id: reservedPayment.id
                            }, {
                                paymentDate: nextPaymentDate
                            });

                            await queryRunner.commitTransaction();
                        }

                        catch (e) {
                            await queryRunner.rollbackTransaction();
                            await queryRunner.release();

                            return failure({
                                success: false,
                                message: "DBException"
                            })
                        }

                        finally {
                            await queryRunner.release();
                        }
                    }

                    else {
                        return failure({
                            success: false,
                            message: "ReSubscribeFailedException"
                        })
                    }

                    return success({
                        success: true,
                        message: "done"
                    });
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
        console.log(e)
        return failure({
            success: false,
            message: "PauseSubscribeException"
        });
    }
}