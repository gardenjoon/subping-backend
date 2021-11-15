import { APIGatewayProxyHandler } from 'aws-lambda';
import SubpingRDB, { Repository } from 'subpingrdb';
import { success, failure } from "../../libs/response-lib";

export const handler: APIGatewayProxyHandler = async (event, _context) => {
    try {
        const header = event.headers;
        const userId = header.id;
        const body = JSON.parse(event.body || "");

        const { subscribeId } = body;

        const subpingRDB = new SubpingRDB();
        const connection = await subpingRDB.getConnection("dev");
        const subscribeRepository = connection.getCustomRepository(Repository.Subscribe);

        const subscribe = await subscribeRepository.querySubscribes(userId, {
            subscribeId: subscribeId
        })[0];

        if(subscribe) {
            if(subscribe.userId == userId) {

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

        else {
            return failure({
                success: false,
                message: "NoSubscribeException"
            });
        }
    }

    catch (e) {
        return failure({
            success: false,
            message: "CancelSubscribeException"
        });
    }
}