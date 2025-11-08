const { DynamoDBClient, PutItemCommand } = require("@aws-sdk/client-dynamodb");
const { marshall } = require("@aws-sdk/util-dynamodb");
const { v4: uuidv4 } = require("uuid");

const client = new DynamoDBClient({});

exports.handler = async (event) => {
  try {
    const body = JSON.parse(event.body);
    const movieId = uuidv4();
    const movieItem = {
      pk: `m${movieId}`,
      sk: 'xxxx',
      title: body.title,
      releaseDate: body.releaseDate || "Uknown", 
      overview: body.overview || "N/A",
      entityType: "Movie"
    };

    await client.send(new PutItemCommand({
      TableName: process.env.TABLE_NAME,
      Item: marshall(movieItem)
    }));

    console.log(`POST + ${movie.pk} | ${movie.title} | ${movie.releaseDate} | ${movie.overview}`);


    return {
      statusCode: 201,
      body: JSON.stringify({ message: "Movie added", movieItem })
    };
  } catch (err) {
    console.error("Error in AddMovieLambda:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message })
    };
  }
};
