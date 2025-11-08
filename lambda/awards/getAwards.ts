import { DynamoDBClient, ScanCommand } from "@aws-sdk/client-dynamodb";
import { unmarshall } from "@aws-sdk/util-dynamodb";
import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";

const client = new DynamoDBClient({});

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const params = event.queryStringParameters || {};
    const { movie, actor, awardBody } = params;

    let filter = "begins_with(pk, :w)";
    const values: Record<string, any> = { ":w": { S: "w" } };

    if (movie) {
      filter += " AND contains(pk, :movie)";
      values[":movie"] = { S: movie };
    }
    if (actor) {
      filter += " AND contains(pk, :actor)";
      values[":actor"] = { S: actor };
    }
    if (awardBody) {
      filter += " AND contains(sk, :body)";
      values[":body"] = { S: awardBody };
    }

    const data = await client.send(
      new ScanCommand({
        TableName: process.env.TABLE_NAME,
        FilterExpression: filter,
        ExpressionAttributeValues: values,
      })
    );

    const awards = data.Items?.map((i) => unmarshall(i)) || [];
    return { statusCode: 200, body: JSON.stringify(awards) };
  } catch (err: any) {
    console.error("Error in GetAwardsLambda:", err);
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};
