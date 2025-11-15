import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as apigateway from "aws-cdk-lib/aws-apigateway";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";
import * as lambdaNode from "aws-cdk-lib/aws-lambda-nodejs";
import * as lambda from "aws-cdk-lib/aws-lambda";


export class CloudAppCaStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);


    const moviesTable = new dynamodb.Table(this, 'MoviesTable', {
      partitionKey: { name: "pk", type: dynamodb.AttributeType.STRING },
      sortKey: { name: "sk", type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
    });

    // GET
    const getMoviesLambda = new lambdaNode.NodejsFunction(this, 'GetMoviesLambda', {
      entry: 'lambda/movies/getMovies.ts',
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'handler',
      environment: {
        TABLE_NAME: moviesTable.tableName,
      },
    });

    //GET BY ID
    const getMovieByIdLambda = new lambdaNode.NodejsFunction(this, "GetMovieByIdLambda", {
      entry: "lambda/movies/getMovieById.ts",
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: "handler",
      environment: {TABLE_NAME: moviesTable.tableName},
    });

    // ADD 
    const addMovieLambda = new lambdaNode.NodejsFunction(this, 'AddMovieLambda', {
      entry: 'lambda/movies/addMovie.ts',
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'handler',
      environment: {
        TABLE_NAME: moviesTable.tableName,
      },
    });

    //DELETE
    const deleteMovieLambda = new lambdaNode.NodejsFunction(this, "DeleteMovieLambda", {
      entry: "lambda/movies/deleteMovie.ts",
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: "handler",
      environment: {TABLE_NAME: moviesTable.tableName},
    });

    //ACTORS
    const getActorsLambda = new lambdaNode.NodejsFunction(this, "GetActorsLambda", {
      entry: "lambda/actors/getActors.ts",
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: "handler",
      environment: {TABLE_NAME: moviesTable.tableName},
    });

     const addActorsLambda = new lambdaNode.NodejsFunction(this, "AddActorsLambda", {
      entry: "lambda/actors/addActor.ts",
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: "handler",
      environment: {TABLE_NAME: moviesTable.tableName},
    });

    //AWARDS
    const getAwardsLambda = new lambdaNode.NodejsFunction(this, "GetAwardsLambda", {
      entry: "lambda/awards/getAwards.ts",
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: "handler",
      environment: {TABLE_NAME: moviesTable.tableName},
    });

    //CAST by movie
  const getCastByMovieLambda = new lambdaNode.NodejsFunction(this, "GetCastByMovieLambda", {
    entry: "lambda/cast/getCastByMovie.ts",
    runtime: lambda.Runtime.NODEJS_18_X,
    handler: "handler",
    environment: { TABLE_NAME: moviesTable.tableName },
  });

  //ACTOR in movie
  const getActorInMovieLambda = new lambdaNode.NodejsFunction(this, "GetActorInMovieLambda", {
    entry: "lambda/cast/getActorInMovie.ts",
    runtime: lambda.Runtime.NODEJS_18_X,
    handler: "handler",
    environment: { TABLE_NAME: moviesTable.tableName },
  });



    //PERMISSIONS
    moviesTable.grantReadData(getMoviesLambda);
    moviesTable.grantReadWriteData(addMovieLambda);
    moviesTable.grantReadData(getMovieByIdLambda);
    moviesTable.grantReadWriteData(deleteMovieLambda);
    moviesTable.grantReadData(getActorsLambda);
    moviesTable.grantReadWriteData(addActorsLambda);
    moviesTable.grantReadData(getAwardsLambda);
    moviesTable.grantReadData(getCastByMovieLambda);
    moviesTable.grantReadData(getActorInMovieLambda);



// API
const api = new apigateway.RestApi(this, "MoviesApi", {
  restApiName: "Movies Service",
  description: "API for managing movie information.",
});



// /movies
const movies = api.root.addResource("movies");
movies.addMethod("GET", new apigateway.LambdaIntegration(getMoviesLambda), {
});

movies.addMethod("POST", new apigateway.LambdaIntegration(addMovieLambda), {
});


// /movies/{id}
const movieById = movies.addResource("{id}");
movieById.addMethod("GET", new apigateway.LambdaIntegration(getMovieByIdLambda), {
});
movieById.addMethod("DELETE", new apigateway.LambdaIntegration(deleteMovieLambda), {
});

// /actors
const actors = api.root.addResource("actors");
actors.addMethod("GET", new apigateway.LambdaIntegration(getActorsLambda), {
  
});
actors.addMethod("POST", new apigateway.LambdaIntegration(addActorsLambda), {
});

// /awards
const awards = api.root.addResource("awards");
awards.addMethod("GET", new apigateway.LambdaIntegration(getAwardsLambda), {
 
});

// /movies/{id}/actors
const actorsInMovie = movieById.addResource("actors");
actorsInMovie.addMethod("GET", new apigateway.LambdaIntegration(getCastByMovieLambda), {
 
});

// /movies/{id}/actors/{actorId}
const specificActor = actorsInMovie.addResource("{actorId}");
specificActor.addMethod("GET", new apigateway.LambdaIntegration(getActorInMovieLambda), {
 
});


// Output the API URL
new cdk.CfnOutput(this, "ApiUrl", { value: api.url ?? "No URL returned" });
  }
}
