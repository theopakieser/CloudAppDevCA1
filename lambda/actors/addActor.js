const { DynamoDBClient, PutItemCommand } = require("@aws-sdk/client-dynamodb");
const { marshall } = require("@aws-sdk/util-dynamodb");
const { v4: uuidv4 } = require("uuid");

const client = new DynamoDBClient({});

exports.handler = async (event) => {
  try {
    const body = JSON.parse(event.body);
    const actorId = uuidv4();

    const actorItem = {
      pk: `a${actorId}`,
      sk: "xxxx",
      name: body.name,
      bio: body.bio || "",
      dateOfBirth: body.dateOfBirth || "unknown",
      entityType: "Actor",
    };

    await client.send(new PutItemCommand({
      TableName: process.env.TABLE_NAME,
      Item: marshall(actorItem),
    }));

    return {
      statusCode: 201,
      body: JSON.stringify({ message: "Actor added", actor: actorItem }),
    };
  } catch (err) {
    console.error("Error in AddActorLambda:", err);
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};
