import { DynamoDBClient, GetItemCommand } from "@aws-sdk/client-dynamodb";
import { unmarshall } from "@aws-sdk/util-dynamodb";
import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";

const client = new DynamoDBClient({});

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const movieId = event.pathParameters?.id;
    const actorId = event.pathParameters?.actorId;

    if (!movieId || !actorId) {
      return { statusCode: 400, body: JSON.stringify({ error: "Movie ID and Actor ID required" }) };
    }

    const pk = `c${movieId}`;
    const sk = actorId;

    const data = await client.send(
      new GetItemCommand({
        TableName: process.env.TABLE_NAME,
        Key: { pk: { S: pk }, sk: { S: sk } },
      })
    );

    if (!data.Item) {
      return { statusCode: 404, body: JSON.stringify({ message: "Cast member not found" }) };
    }

    const castMember = unmarshall(data.Item);
    return { statusCode: 200, body: JSON.stringify(castMember) };
  } catch (err: any) {
    console.error("Error in GetActorInMovieLambda:", err);
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};
