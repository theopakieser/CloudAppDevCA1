const { DynamoDBClient, ScanCommand } = require("@aws-sdk/client-dynamodb");
const { unmarshall } = require("@aws-sdk/util-dynamodb");

const client = new DynamoDBClient({});

exports.handler = async () => {
  try {
    const data = await client.send(new ScanCommand({
      TableName: process.env.TABLE_NAME,
      FilterExpression: "begins_with(pk, :a)",
      ExpressionAttributeValues: { ":a": { S: "a" } },
    }));

    const actors = data.Items.map(i => unmarshall(i));
    return { statusCode: 200, body: JSON.stringify(actors) };
  } catch (err) {
    console.error("Error in GetActorsLambda:", err);
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};
