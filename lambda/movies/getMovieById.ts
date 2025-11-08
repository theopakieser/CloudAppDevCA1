import { DynamoDBClient, GetItemCommand } from "@aws-sdk/client-dynamodb";
import { unmarshall } from "@aws-sdk/util-dynamodb";
import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";

const client = new DynamoDBClient({});

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const movieId = event.pathParameters?.id;
    if (!movieId) {
      return { statusCode: 400, body: JSON.stringify({ error: "Movie ID is required" }) };
    }

    const pk = `m${movieId}`;

    const data = await client.send(
      new GetItemCommand({
        TableName: process.env.TABLE_NAME,
        Key: { pk: { S: pk }, sk: { S: "xxxx" } },
      })
    );

    if (!data.Item) {
      return { statusCode: 404, body: JSON.stringify({ message: "Movie not found" }) };
    }

    const movie = unmarshall(data.Item);
    return { statusCode: 200, body: JSON.stringify(movie) };
  } catch (err: any) {
    console.error("Error in GetMovieByIdLambda:", err);
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};
