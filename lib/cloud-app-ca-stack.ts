import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';

export class CloudAppCaStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const moviesTable = new dynamodb.Table(this, 'MoviesTable', {
      partitionKey: { name: 'id', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
    });

    const getMoviesLambda = new lambda.Function(this, 'GetMoviesLambda', {
      runtime: lambda.Runtime.NODEJS_18_X,
      code: lambda.Code.fromAsset('lambda'),
      handler: 'getMovies.handler',
      environment: {
        TABLE_NAME: moviesTable.tableName,
      },
    });

    const addMovieLambda = new lambda.Function(this, 'AddMovieLambda', {
      runtime: lambda.Runtime.NODEJS_18_X,
      code: lambda.Code.fromAsset('lambda'),
      handler: 'addMovie.handler',
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
