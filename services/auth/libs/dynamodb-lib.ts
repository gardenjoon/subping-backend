import AWS from "aws-sdk";

export function call(action, params) {
  const dynamoDb = new AWS.DynamoDB.DocumentClient({
    convertEmptyValues: true,
    region: 'ap-northeast-2'
  });

  return dynamoDb[action](params).promise();
}