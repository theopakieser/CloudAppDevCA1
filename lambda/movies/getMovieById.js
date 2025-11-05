const { DynamoDBClient, GetItemCommand } = require("@aws-sdk/client-dynamodb");
const { unmarshall } = require("@aws-sdk/util-dynamodb");

const client = new DynamoDBClient({});

exports.handler = async (event) => {
  try {
    const movieId = event.pathParameters.id;
    const pk = movieId.startsWith("m") ? movieId: `m${movieId}`;

    const data = await client.send(
      new GetItemCommand({
        TableName: process.env.TABLE_NAME,
        Key: { pk: { S: pk }, sk: { S: "xxxx" } },
      })
    );

    if (!data.Item)
      return { statusCode: 404, body: JSON.stringify({ message: "Movie not found" }) };

    const movie = unmarshall(data.Item);
    return { statusCode: 200, body: JSON.stringify(movie) };
  } catch (err) {
    console.error("Error in GetMovieByIdLambda:", err);
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};
