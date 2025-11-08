import { DynamoDBClient, ScanCommand } from "@aws-sdk/client-dynamodb";
import { unmarshall } from "@aws-sdk/util-dynamodb";
import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";

const client = new DynamoDBClient({});

export const handler = async (_event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const data = await client.send(
      new ScanCommand({
        TableName: process.env.TABLE_NAME,
        FilterExpression: "begins_with(pk, :m)",
        ExpressionAttributeValues: { ":m": { S: "m" } },
      })
    );

    const movies = data.Items?.map((item) => unmarshall(item)) || [];

    return {
      statusCode: 200,
      body: JSON.stringify(movies),
    };
  } catch (err: any) {
    console.error("Error in GetMoviesLambda:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message }),
    };
  }
};