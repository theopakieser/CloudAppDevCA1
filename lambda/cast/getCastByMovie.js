const { DynamoDBClient, QueryCommand } = require("@aws-sdk/client-dynamodb");
const { unmarshall } = require("@aws-sdk/util-dynamodb");

const client = new DynamoDBClient({});

exports.handler = async (event) => {
  try {
    const movieId = event.pathParameters.id;
    const cleanId = movieId.startsWith("m") ? movieId.substring(1) : movieId;
    const pk = `c${cleanId}`;

    const data = await client.send(
      new QueryCommand({
        TableName: process.env.TABLE_NAME,
        KeyConditionExpression: "pk = :pk",
        ExpressionAttributeValues: { ":pk": { S: pk } },
      })
    );

    const cast = data.Items.map((i) => unmarshall(i));
    return { statusCode: 200, body: JSON.stringify(cast) };
  } catch (err) {
    console.error("Error in GetCastByMovieLambda:", err);
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};
