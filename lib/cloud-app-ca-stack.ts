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
      entry: 'lambda/getMovies.js',
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'handler',
      environment: {
        TABLE_NAME: moviesTable.tableName,
      },
    });

    // POST 
    const addMovieLambda = new lambdaNode.NodejsFunction(this, 'AddMovieLambda', {
      entry: 'lambda/addMovie.js',
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'handler',
      environment: {
        TABLE_NAME: moviesTable.tableName,
      },
    });

    moviesTable.grantReadData(getMoviesLambda);
    moviesTable.grantReadWriteData(addMovieLambda);

    const api = new apigateway.RestApi(this, 'MoviesApi', {
      restApiName: 'Movies Service',
      description: 'API for managing movie information.',
    });

    const movies = api.root.addResource('movies');
    movies.addMethod('GET', new apigateway.LambdaIntegration(getMoviesLambda));
    movies.addMethod('POST', new apigateway.LambdaIntegration(addMovieLambda));

    new cdk.CfnOutput(this, 'ApiUrl', { value: api.url ?? 'No URL returned' });
  }
}
