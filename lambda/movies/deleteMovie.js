const { DynamoDBClient, DeleteItemCommand } = require("@aws-sdk/client-dynamodb");

const client = new DynamoDBClient({});

exports.handler = async (event) => {
  try {
    const movieId = event.pathParameters.id;
    const pk = movieId.startsWith("m") ? movieId : `m${movieId}`;

    const params = {
      TableName: process.env.TABLE_NAME,
      Key: {
        pk: { S: pk },
        sk: { S: "xxxx" },
      },
      ReturnValues: "ALL_OLD",
    };

    const result = await client.send(new DeleteItemCommand(params));

    if (!result.Attributes) {
      console.log("No item found to delete:", pk);
      return {
        statusCode: 404,
        body: JSON.stringify({ message: `Movie ${pk} not found.` }),
      };
    }

    console.log("Deleted:", result.Attributes);

    return {
      statusCode: 200,
      body: JSON.stringify({ message: `Movie ${pk} deleted.` }),
    };
  } catch (err) {
    console.error("Error in DeleteMovieLambda:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message }),
    };
  }
};
