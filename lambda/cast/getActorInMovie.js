const { DynamoDBClient, GetItemCommand } = require("@aws-sdk/client-dynamodb");
const { unmarshall } = require("@aws-sdk/util-dynamodb");

const client = new DynamoDBClient({});

exports.handler = async (event) => {
  try {
    const movieId = event.pathParameters.id;
    const actorId = event.pathParameters.actorId;
    const pk = `c${movieId}`;

    const data = await client.send(
      new GetItemCommand({
        TableName: process.env.TABLE_NAME,
        Key: { pk: { S: pk }, sk: { S: actorId } },
      })
    );

    if (!data.Item)
      return { statusCode: 404, body: JSON.stringify({ message: "Cast member not found" }) };

    const castMember = unmarshall(data.Item);
    return { statusCode: 200, body: JSON.stringify(castMember) };
  } catch (err) {
    console.error("Error in GetActorInMovieLambda:", err);
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};
