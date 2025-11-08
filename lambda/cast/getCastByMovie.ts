import { DynamoDBClient, QueryCommand } from "@aws-sdk/client-dynamodb";
import { unmarshall } from "@aws-sdk/util-dynamodb";
import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";

const client = new DynamoDBClient({});

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const movieId = event.pathParameters?.id;
    if (!movieId) {
      return { statusCode: 400, body: JSON.stringify({ error: "Movie ID required" }) };
    }

    const pk = `c${movieId}`;

    const data = await client.send(
      new QueryCommand({
        TableName: process.env.TABLE_NAME,
        KeyConditionExpression: "pk = :pk",
        ExpressionAttributeValues: { ":pk": { S: pk } },
      })
    );

    const cast = data.Items?.map((i) => unmarshall(i)) || [];

    return { statusCode: 200, body: JSON.stringify(cast) };
  } catch (err: any) {
    console.error("Error in GetCastByMovieLambda:", err);
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};
