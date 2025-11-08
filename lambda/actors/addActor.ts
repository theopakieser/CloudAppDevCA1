import { DynamoDBClient, PutItemCommand } from "@aws-sdk/client-dynamodb";
import { marshall } from "@aws-sdk/util-dynamodb";
import { v4 as uuidv4 } from "uuid";
import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";

const client = new DynamoDBClient({});

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const body = event.body ? JSON.parse(event.body) : {};
    const actorId = uuidv4();

    const actor = {
      pk: `a${actorId}`,
      sk: "xxxx",
      name: body.name,
      bio: body.bio,
      dateOfBirth: body.dateOfBirth,
      entityType: "Actor",
    };

    await client.send(
      new PutItemCommand({
        TableName: process.env.TABLE_NAME,
        Item: marshall(actor),
      })
    );

    console.log(`POST + ${actor.pk} | ${actor.name} | ${actor.dateOfBirth}`);

    return {
      statusCode: 201,
      body: JSON.stringify({ message: "Actor added", actorItem: actor }),
    };
  } catch (err: any) {
    console.error("Error in AddActorLambda:", err);
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};
