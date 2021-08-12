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

        let contentPathList = [];

        await s3.listObjectsV2({ Bucket: bucketName }, (err, data) => {
            if (err) {
                throw err;
            }
            let contents = data.Contents;
            const requestPath = 'u'
            contents.forEach((content) => {
                if (content.Key[0] == requestPath){
                    const path = `https://${bucketName}.s3.ap-northeast-2.amazonaws.com/${content.Key}`
                    contentPathList.push(path);
                }
            });
        }).promise();

        return success({
            success: true,
            message: contentPathList
        });
    }

    catch (e) {
        console.log(e);
        return failure({
            success: false,
            message: "getImageException"
        })
    }
}