import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as lambdaNode from 'aws-cdk-lib/aws-lambda-nodejs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import { CognitoStack } from "./cognito-stack";

interface CloudAppCaStackProps extends cdk.StackProps {
  authStack: CognitoStack; 
}

export class CloudAppCaStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: CloudAppCaStackProps) {
    super(scope, id, props);

    const { authStack } = props;

    const moviesTable = new dynamodb.Table(this, 'MoviesTable', {
      partitionKey: { name: "pk", type: dynamodb.AttributeType.STRING },
      sortKey: { name: "sk", type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
    });

    // GET
    const getMoviesLambda = new lambdaNode.NodejsFunction(this, 'GetMoviesLambda', {
      entry: 'lambda/movies/getMovies.js',
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'handler',
      environment: {
        TABLE_NAME: moviesTable.tableName,
      },
    });

    //GET BY ID
    const getMovieByIdLambda = new lambdaNode.NodejsFunction(this, "GetMovieByIdLambda", {
      entry: "lambda/movies/getMovieById.js",
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: "handler",
      environment: {TABLE_NAME: moviesTable.tableName},
    });

    // ADD 
    const addMovieLambda = new lambdaNode.NodejsFunction(this, 'AddMovieLambda', {
      entry: 'lambda/movies/addMovie.js',
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'handler',
      environment: {
        TABLE_NAME: moviesTable.tableName,
      },
    });

    //DELETE
    const deleteMovieLambda = new lambdaNode.NodejsFunction(this, "DeleteMovieLambda", {
      entry: "lambda/movies/deleteMovie.js",
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: "handler",
      environment: {TABLE_NAME: moviesTable.tableName},
    });

    //ACTORS
    const getActorsLambda = new lambdaNode.NodejsFunction(this, "GetActorsLambda", {
      entry: "lambda/actors/getActors.js",
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: "handler",
      environment: {TABLE_NAME: moviesTable.tableName},
    });

     const addActorsLambda = new lambdaNode.NodejsFunction(this, "AddActorsLambda", {
      entry: "lambda/actors/addActor.js",
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: "handler",
      environment: {TABLE_NAME: moviesTable.tableName},
    });

    //AWARDS
    const getAwardsLambda = new lambdaNode.NodejsFunction(this, "GetAwardsLambda", {
      entry: "lambda/awards/getAwards.js",
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: "handler",
      environment: {TABLE_NAME: moviesTable.tableName},
    });

    //CAST by movie
  const getCastByMovieLambda = new lambdaNode.NodejsFunction(this, "GetCastByMovieLambda", {
    entry: "lambda/cast/getCastByMovie.js",
    runtime: lambda.Runtime.NODEJS_18_X,
    handler: "handler",
    environment: { TABLE_NAME: moviesTable.tableName },
  });

  //ACTOR in movie
  const getActorInMovieLambda = new lambdaNode.NodejsFunction(this, "GetActorInMovieLambda", {
    entry: "lambda/cast/getActorInMovie.js",
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

const authorizer = new apigateway.CognitoUserPoolsAuthorizer(this, "MovieAuthorizer", {
  cognitoUserPools: [authStack.userPool],
});

// /movies
const movies = api.root.addResource("movies");
movies.addMethod("GET", new apigateway.LambdaIntegration(getMoviesLambda), {
  authorizer,
  authorizationType: apigateway.AuthorizationType.COGNITO,
});

movies.addMethod("POST", new apigateway.LambdaIntegration(addMovieLambda), {
  apiKeyRequired: true,
});


// /movies/{id}
const movieById = movies.addResource("{id}");
movieById.addMethod("GET", new apigateway.LambdaIntegration(getMovieByIdLambda), {
  authorizer,
  authorizationType: apigateway.AuthorizationType.COGNITO,
});
movieById.addMethod("DELETE", new apigateway.LambdaIntegration(deleteMovieLambda), {
  apiKeyRequired: true,
});

// /actors
const actors = api.root.addResource("actors");
actors.addMethod("GET", new apigateway.LambdaIntegration(getActorsLambda), {
  authorizer,
  authorizationType: apigateway.AuthorizationType.COGNITO,
});
actors.addMethod("POST", new apigateway.LambdaIntegration(addActorsLambda), {
  apiKeyRequired: true,
});

// /awards
const awards = api.root.addResource("awards");
awards.addMethod("GET", new apigateway.LambdaIntegration(getAwardsLambda), {
  authorizer,
  authorizationType: apigateway.AuthorizationType.COGNITO,
});

// /movies/{id}/actors
const actorsInMovie = movieById.addResource("actors");
actorsInMovie.addMethod("GET", new apigateway.LambdaIntegration(getCastByMovieLambda), {
  authorizer,
  authorizationType: apigateway.AuthorizationType.COGNITO,
});

// /movies/{id}/actors/{actorId}
const specificActor = actorsInMovie.addResource("{actorId}");
specificActor.addMethod("GET", new apigateway.LambdaIntegration(getActorInMovieLambda), {
  authorizer,
  authorizationType: apigateway.AuthorizationType.COGNITO,
});

// cognito admin api
const plan = api.addUsagePlan("UsagePlan", {
  name: "AdminUsagePlan",
  throttle: { rateLimit: 10, burstLimit: 2 },
});

const apiKey = api.addApiKey("AdminApiKey", {
  apiKeyName: "MovieAdminKey",
});

plan.addApiKey(apiKey);
plan.addApiStage({ stage: api.deploymentStage });


// Output the API URL
new cdk.CfnOutput(this, "ApiUrl", { value: api.url ?? "No URL returned" });
  }
}
