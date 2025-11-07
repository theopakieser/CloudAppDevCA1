#!/usr/bin/env node
import * as cdk from "aws-cdk-lib";
import { CloudAppCaStack } from "../lib/cloud-app-ca-stack";
import { CognitoStack } from "../lib/cognito-stack";

const app = new cdk.App();


const authStack = new CognitoStack(app, "AuthStack", {
  env: { region: "us-east-1" },
});


new CloudAppCaStack(app, "CloudAppCaStack", {
  env: { region: "us-east-1" },
  authStack: authStack, 
});
