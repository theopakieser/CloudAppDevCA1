const { DynamoDBClient, ScanCommand } = require("@aws-sdk/client-dynamodb");
const { unmarshall } = require("@aws-sdk/util-dynamodb");

const client = new DynamoDBClient({});

exports.handler = async () => {
  try {
    const data = await client.send(new ScanCommand({
      TableName: process.env.TABLE_NAME,
      FilterExpression: "begins_with(pk, :m)", //only include items where parition key starts with "m" ie- movies
      ExpressionAttributeValues: {":m": {S: "m"}}, //defines value in filter, ie- is a string
    }));
    const movies = data.Items.map(item => unmarshall(item));
    return {
      statusCode: 200,
      body: JSON.stringify(movies)
    };
  } catch (err) {
    console.error("Error in GetMoviesLambda:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message })
    };
  }
};
