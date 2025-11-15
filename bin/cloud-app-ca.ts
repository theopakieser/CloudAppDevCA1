#!/usr/bin/env node
import * as cdk from "aws-cdk-lib";
import { CloudAppCaStack } from "../lib/cloud-app-ca-stack";

const app = new cdk.App();

new CloudAppCaStack(app, "CloudAppCaStack");
