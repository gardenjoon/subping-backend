import * as AWS from 'aws-sdk';
import { APIGatewayProxyHandler } from 'aws-lambda';
import { success, failure } from "../../libs/response-lib";

export const handler: APIGatewayProxyHandler = async (event, content) => {
    const saveImage = async (content: any, name: string, path: string) => {
        const bucketName = "subping-userimage"
        const s3 = new AWS.S3({
            params: { Bucket: bucketName },
            region: 'ap-northeast-2',
        });
        const bodyBuffer = Buffer.from(content, 'base64');
        const s3Params:any = {
            Bucket: bucketName,
            Key: `${path}/${name}`,
            ContentType : content.type,
            ACL : 'public-read-write',
            Body : bodyBuffer,
            ContentEncoding : 'base64'
        }
        await s3.putObject(s3Params).promise()
    }
    try{
        const body = JSON.parse(JSON.stringify(event.body))

        let path:string;

        if (body.userEmail){
            path = 'userProfile/' + body.userEmail
        }
        else if(body.reviewImageId) {
            path = 'reviewImage/' + body.reviewImageId
        }

        if (body.name.length > 1){
            for (const [index, content] of body.contents.entries()){
                console.log(typeof(body.contents))
                await saveImage(content, body.name[index], path)
            }
        }
        else {
            await saveImage(body, body.name, path)
        }

        return success({
            success: true,
            message: "saveImageSuccess"
        });
    }

    catch (e) {
        console.log(e.code);
        return failure({
            success: false,
            message: "MakeUploadImageException"
        })
    }
}
