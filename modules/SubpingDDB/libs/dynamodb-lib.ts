import { DynamoDB } from "aws-sdk";

type TActions = "put" | "query" | "update" | "delete" | "transactWrite"

export function call(action: TActions, params: any, callback?: (err: any, data: any) => void) {
  const dynamoDb = new DynamoDB.DocumentClient({
    convertEmptyValues: true,
    region: 'ap-northeast-2'
  });

  if (action === "transactWrite") {
    return dynamoDb.transactWrite({
      TransactItems: params
    }, callback).promise(); 
  }

  else {
    return dynamoDb[action](params, callback).promise();
  }
}