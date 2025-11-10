import { DynamoDBClient, DeleteItemCommand } from "@aws-sdk/client-dynamodb";
import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";

const client = new DynamoDBClient({});

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    const movieId = event.pathParameters?.id;

    if (!movieId) {
      return { statusCode: 400, body: JSON.stringify({ message: "Movie ID is required" }) };
    }

    const pk = `m${movieId}`;

    await client.send(
      new DeleteItemCommand({
        TableName: process.env.TABLE_NAME,
        Key: { pk: { S: pk }, sk: { S: "xxxx" } },
      })
    );

    console.log(`DELETE + ${pk} | Movie removed from table`);

    return {
      statusCode: 200,
      body: JSON.stringify({ message: `Movie ${movieId} deleted.` }),
    };
  } catch (err: any) {
    console.error("Error in DeleteMovieLambda:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message }),
    };
  }
};
