import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as lambdaNode from 'aws-cdk-lib/aws-lambda-nodejs';
import * as lambda from 'aws-cdk-lib/aws-lambda';

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

    // POST 
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

    //PERMISSIONS
    moviesTable.grantReadData(getMoviesLambda);
    moviesTable.grantReadWriteData(addMovieLambda);
    moviesTable.grantReadData(getMovieByIdLambda);
    moviesTable.grantReadWriteData(deleteMovieLambda);
    moviesTable.grantReadData(getActorsLambda);
    moviesTable.grantReadWriteData(addActorsLambda);


    //API
    const api = new apigateway.RestApi(this, 'MoviesApi', {
      restApiName: 'Movies Service',
      description: 'API for managing movie information.',
    });


    const movies = api.root.addResource('movies');
    movies.addMethod('GET', new apigateway.LambdaIntegration(getMoviesLambda));
    movies.addMethod('POST', new apigateway.LambdaIntegration(addMovieLambda));

    new cdk.CfnOutput(this, 'ApiUrl', { value: api.url ?? 'No URL returned' });
  
  const movieById = movies.addResource("{id}");
  movies.addMethod('GET', new apigateway.LambdaIntegration(getMovieByIdLambda));
  movies.addMethod('DELETE', new apigateway.LambdaIntegration(deleteMovieLambda));
  
    const actors = api.root.addResource('actors');
    movies.addMethod('GET', new apigateway.LambdaIntegration(getActorsLambda));
    movies.addMethod('POST', new apigateway.LambdaIntegration(addActorsLambda)); 


  }
}
