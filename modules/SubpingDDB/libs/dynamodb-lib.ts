import * as AWS from "aws-sdk";

type TActions = "put" | "query" | "update" | "delete"

export function call(action: TActions, params: any, callback?: (err: any, data: any) => void) {
  const dynamoDb = new AWS.DynamoDB.DocumentClient({
    convertEmptyValues: true,
    region: 'ap-northeast-2'
  });

  return dynamoDb[action](params, callback).promise();
}