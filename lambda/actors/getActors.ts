import { DynamoDBClient, ScanCommand } from "@aws-sdk/client-dynamodb";
import { unmarshall } from "@aws-sdk/util-dynamodb";
import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";

const client = new DynamoDBClient({});

export const handler = async (_event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const data = await client.send(
      new ScanCommand({
        TableName: process.env.TABLE_NAME,
        FilterExpression: "begins_with(pk, :a)",
        ExpressionAttributeValues: { ":a": { S: "a" } },
      })
    );

    const actors = data.Items?.map((i) => unmarshall(i)) || [];

    return { statusCode: 200, body: JSON.stringify(actors) };
  } catch (err: any) {
    console.error("Error in GetActorsLambda:", err);
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};
