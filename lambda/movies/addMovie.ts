import { DynamoDBClient, PutItemCommand } from "@aws-sdk/client-dynamodb";
import { marshall } from "@aws-sdk/util-dynamodb";
import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";

const client = new DynamoDBClient({});

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    const { v4: uuidv4 } = await import("uuid");

    if (!event.body) {
      return { statusCode: 400, body: JSON.stringify({ error: "Missing request body" }) };
    }

    const body = JSON.parse(event.body);
    const movieId = uuidv4(); 

    const movie = {
      pk: `m${movieId}`,
      sk: "xxxx",
      title: body.title,
      releaseDate: body.releaseDate,
      overview: body.overview,
      entityType: "Movie",
    };

    await client.send(
      new PutItemCommand({
        TableName: process.env.TABLE_NAME,
        Item: marshall(movie),
      })
    );

    console.log(`POST + ${movie.pk} | ${movie.title}`);

    return {
      statusCode: 201,
      body: JSON.stringify({ message: "Movie added successfully", movieItem: movie }),
    };
  } catch (err: any) {
    console.error("Error in AddMovieLambda:", err);
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};
