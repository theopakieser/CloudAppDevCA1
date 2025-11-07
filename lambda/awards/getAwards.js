const { DynamoDBClient, ScanCommand } = require("@aws-sdk/client-dynamodb");
const { unmarshall } = require("@aws-sdk/util-dynamodb");

const client = new DynamoDBClient({});

exports.handler = async (event) => {
  try {
    const params = event.queryStringParameters || {};
    const { movie, actor, awardBody } = params;

    // Build filter expression dynamically
    let filter = "begins_with(pk, :w)";
    let values = { ":w": { S: "w" } };

    if (movie) {
      filter += " AND contains(pk, :movie)";
      values[":movie"] = { S: movie };
    }
    if (actor) {
      filter += " AND contains(pk, :actor)";
      values[":actor"] = { S: actor };
    }
    if (awardBody) {
      filter += " AND contains(sk, :body)";
      values[":body"] = { S: awardBody };
    }

    const data = await client.send(new ScanCommand({
      TableName: process.env.TABLE_NAME,
      FilterExpression: filter,
      ExpressionAttributeValues: values,
    }));

    const awards = data.Items.map(i => unmarshall(i));
    return { statusCode: 200, body: JSON.stringify(awards) };
  } catch (err) {
    console.error("Error in GetAwardsLambda:", err);
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};
