import * as AWS from 'aws-sdk';
import { APIGatewayProxyHandler } from 'aws-lambda';
import { success, failure } from "../../libs/response-lib";

export const handler: APIGatewayProxyHandler = async (event, content) => {
    try{
        const bucketName = "subping-userimage"

        const s3 = new AWS.S3({
            params: { Bucket: bucketName },
            region: 'ap-northeast-2',
        });
        const body = JSON.parse(JSON.stringify(event.body))
        
        let path:string;

        if (body.userEmail){
            path = 'userProfile/' + body.userEmail
        }
        else if(body.reviewImageId) {
            path = 'reviewImage/' + body.reviewImageId
        }

        const s3Params:any = {
            Bucket: bucketName,
            Key: `${path}/${body.name}`,
        }
        await s3.deleteObject(s3Params).promise()

        return success({
            success: true,
            message: `deleteImageSuccess`
        });
    }

    catch (e) {
        console.log(e);
        return failure({
            success: false,
            message: "deleteImageException"
        })
    }
}