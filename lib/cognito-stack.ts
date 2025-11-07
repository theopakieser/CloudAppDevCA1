import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as lambda from "aws-cdk-lib/aws-lambda";          
import * as lambdaNode from "aws-cdk-lib/aws-lambda-nodejs"; 
import * as apigateway from "aws-cdk-lib/aws-apigateway";
import * as cognito from "aws-cdk-lib/aws-cognito";


export class CognitoStack extends cdk.Stack {
  public readonly userPool: cognito.UserPool;
  public readonly userPoolClient: cognito.UserPoolClient;
  public readonly authApi: apigateway.RestApi;

  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    this.userPool = new cognito.UserPool(this, "MovieUserPool", {
      selfSignUpEnabled: true,
      signInAliases: { email: true },
      autoVerify: { email: true },
    });

this.userPoolClient = new cognito.UserPoolClient(this, "MovieUserPoolClient", {
  userPool: this.userPool,
  authFlows: {
    userPassword: true
  },
});


    this.authApi = new apigateway.RestApi(this, "AuthApi", {
      restApiName: "Auth Service",
      description: "Handles user signup, signin, and signout.",
    });

    const addAuthRoute = (path: string, method: string, file: string) => {
const fn = new lambdaNode.NodejsFunction(this, `${path}Fn`, {
  entry: `lambda/auth/${file}`,
  runtime: lambda.Runtime.NODEJS_18_X, 
  environment: {
    USER_POOL_ID: this.userPool.userPoolId,
    CLIENT_ID: this.userPoolClient.userPoolClientId,
    REGION: this.region,
  },
});

      const resource = this.authApi.root.addResource(path);
      resource.addMethod(method, new apigateway.LambdaIntegration(fn));
    };

    addAuthRoute("signup", "POST", "signup.ts");
    addAuthRoute("confirm_signup", "POST", "confirm-signup.ts");
    addAuthRoute("signin", "POST", "signin.ts");
    addAuthRoute("signout", "GET", "signout.ts");
  }
}
