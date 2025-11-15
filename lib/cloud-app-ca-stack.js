"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CloudAppCaStack = void 0;
const cdk = __importStar(require("aws-cdk-lib"));
const apigateway = __importStar(require("aws-cdk-lib/aws-apigateway"));
const dynamodb = __importStar(require("aws-cdk-lib/aws-dynamodb"));
const lambdaNode = __importStar(require("aws-cdk-lib/aws-lambda-nodejs"));
const lambda = __importStar(require("aws-cdk-lib/aws-lambda"));
class CloudAppCaStack extends cdk.Stack {
    constructor(scope, id, props) {
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
            environment: { TABLE_NAME: moviesTable.tableName },
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
            environment: { TABLE_NAME: moviesTable.tableName },
        });
        //ACTORS
        const getActorsLambda = new lambdaNode.NodejsFunction(this, "GetActorsLambda", {
            entry: "lambda/actors/getActors.ts",
            runtime: lambda.Runtime.NODEJS_18_X,
            handler: "handler",
            environment: { TABLE_NAME: moviesTable.tableName },
        });
        const addActorsLambda = new lambdaNode.NodejsFunction(this, "AddActorsLambda", {
            entry: "lambda/actors/addActor.ts",
            runtime: lambda.Runtime.NODEJS_18_X,
            handler: "handler",
            environment: { TABLE_NAME: moviesTable.tableName },
        });
        //AWARDS
        const getAwardsLambda = new lambdaNode.NodejsFunction(this, "GetAwardsLambda", {
            entry: "lambda/awards/getAwards.ts",
            runtime: lambda.Runtime.NODEJS_18_X,
            handler: "handler",
            environment: { TABLE_NAME: moviesTable.tableName },
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
        movies.addMethod("GET", new apigateway.LambdaIntegration(getMoviesLambda), {});
        movies.addMethod("POST", new apigateway.LambdaIntegration(addMovieLambda), {});
        // /movies/{id}
        const movieById = movies.addResource("{id}");
        movieById.addMethod("GET", new apigateway.LambdaIntegration(getMovieByIdLambda), {});
        movieById.addMethod("DELETE", new apigateway.LambdaIntegration(deleteMovieLambda), {});
        // /actors
        const actors = api.root.addResource("actors");
        actors.addMethod("GET", new apigateway.LambdaIntegration(getActorsLambda), {});
        actors.addMethod("POST", new apigateway.LambdaIntegration(addActorsLambda), {});
        // /awards
        const awards = api.root.addResource("awards");
        awards.addMethod("GET", new apigateway.LambdaIntegration(getAwardsLambda), {});
        // /movies/{id}/actors
        const actorsInMovie = movieById.addResource("actors");
        actorsInMovie.addMethod("GET", new apigateway.LambdaIntegration(getCastByMovieLambda), {});
        // /movies/{id}/actors/{actorId}
        const specificActor = actorsInMovie.addResource("{actorId}");
        specificActor.addMethod("GET", new apigateway.LambdaIntegration(getActorInMovieLambda), {});
        // Output the API URL
        new cdk.CfnOutput(this, "ApiUrl", { value: api.url ?? "No URL returned" });
    }
}
exports.CloudAppCaStack = CloudAppCaStack;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2xvdWQtYXBwLWNhLXN0YWNrLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiY2xvdWQtYXBwLWNhLXN0YWNrLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUEsaURBQW1DO0FBRW5DLHVFQUF5RDtBQUN6RCxtRUFBcUQ7QUFDckQsMEVBQTREO0FBQzVELCtEQUFpRDtBQUdqRCxNQUFhLGVBQWdCLFNBQVEsR0FBRyxDQUFDLEtBQUs7SUFDNUMsWUFBWSxLQUFnQixFQUFFLEVBQVUsRUFBRSxLQUFzQjtRQUM5RCxLQUFLLENBQUMsS0FBSyxFQUFFLEVBQUUsRUFBRSxLQUFLLENBQUMsQ0FBQztRQUd4QixNQUFNLFdBQVcsR0FBRyxJQUFJLFFBQVEsQ0FBQyxLQUFLLENBQUMsSUFBSSxFQUFFLGFBQWEsRUFBRTtZQUMxRCxZQUFZLEVBQUUsRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxRQUFRLENBQUMsYUFBYSxDQUFDLE1BQU0sRUFBRTtZQUNqRSxPQUFPLEVBQUUsRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxRQUFRLENBQUMsYUFBYSxDQUFDLE1BQU0sRUFBRTtZQUM1RCxXQUFXLEVBQUUsUUFBUSxDQUFDLFdBQVcsQ0FBQyxlQUFlO1NBQ2xELENBQUMsQ0FBQztRQUVILE1BQU07UUFDTixNQUFNLGVBQWUsR0FBRyxJQUFJLFVBQVUsQ0FBQyxjQUFjLENBQUMsSUFBSSxFQUFFLGlCQUFpQixFQUFFO1lBQzdFLEtBQUssRUFBRSw0QkFBNEI7WUFDbkMsT0FBTyxFQUFFLE1BQU0sQ0FBQyxPQUFPLENBQUMsV0FBVztZQUNuQyxPQUFPLEVBQUUsU0FBUztZQUNsQixXQUFXLEVBQUU7Z0JBQ1gsVUFBVSxFQUFFLFdBQVcsQ0FBQyxTQUFTO2FBQ2xDO1NBQ0YsQ0FBQyxDQUFDO1FBRUgsV0FBVztRQUNYLE1BQU0sa0JBQWtCLEdBQUcsSUFBSSxVQUFVLENBQUMsY0FB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QXFCO1FBQ3JCLElBQUksR0FBRyxDQUFDLFNBQVMsQ0FBQyxJQUFJLEVBQUUsUUFBUSxFQUFFLEVBQUUsS0FBSyxFQUFFLEdBQUcsQ0FBQyxHQUFHLElBQUksaUJBQWlCLEVBQUUsQ0FBQyxDQUFDO0lBQ3pFLENBQUM7Q0FDRjtBQTNKRCwwQ0EySkMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgKiBhcyBjZGsgZnJvbSBcImF3cy1jZGstbGliXCI7XHJcbmltcG9ydCB7IENvbnN0cnVjdCB9IGZyb20gXCJjb25zdHJ1Y3RzXCI7XHJcbmltcG9ydCAqIGFzIGFwaWdhdGV3YXkgZnJvbSBcImF3cy1jZGstbGliL2F3cy1hcGlnYXRld2F5XCI7XHJcbmltcG9ydCAqIGFzIGR5bmFtb2RiIGZyb20gXCJhd3MtY2RrLWxpYi9hd3MtZHluYW1vZGJcIjtcclxuaW1wb3J0ICogYXMgbGFtYmRhTm9kZSBmcm9tIFwiYXdzLWNkay1saWIvYXdzLWxhbWJkYS1ub2RlanNcIjtcclxuaW1wb3J0ICogYXMgbGFtYmRhIGZyb20gXCJhd3MtY2RrLWxpYi9hd3MtbGFtYmRhXCI7XHJcblxyXG5cclxuZXhwb3J0IGNsYXNzIENsb3VkQXBwQ2FTdGFjayBleHRlbmRzIGNkay5TdGFjayB7XHJcbiAgY29uc3RydWN0b3Ioc2NvcGU6IENvbnN0cnVjdCwgaWQ6IHN0cmluZywgcHJvcHM/OiBjZGsuU3RhY2tQcm9wcykge1xyXG4gICAgc3VwZXIoc2NvcGUsIGlkLCBwcm9wcyk7XHJcblxyXG5cclxuICAgIGNvbnN0IG1vdmllc1RhYmxlID0gbmV3IGR5bmFtb2RiLlRhYmxlKHRoaXMsICdNb3ZpZXNUYWJsZScsIHtcclxuICAgICAgcGFydGl0aW9uS2V5OiB7IG5hbWU6IFwicGtcIiwgdHlwZTogZHluYW1vZGIuQXR0cmlidXRlVHlwZS5TVFJJTkcgfSxcclxuICAgICAgc29ydEtleTogeyBuYW1lOiBcInNrXCIsIHR5cGU6IGR5bmFtb2RiLkF0dHJpYnV0ZVR5cGUuU1RSSU5HIH0sXHJcbiAgICAgIGJpbGxpbmdNb2RlOiBkeW5hbW9kYi5CaWxsaW5nTW9kZS5QQVlfUEVSX1JFUVVFU1QsXHJcbiAgICB9KTtcclxuXHJcbiAgICAvLyBHRVRcclxuICAgIGNvbnN0IGdldE1vdmllc0xhbWJkYSA9IG5ldyBsYW1iZGFOb2RlLk5vZGVqc0Z1bmN0aW9uKHRoaXMsICdHZXRNb3ZpZXNMYW1iZGEnLCB7XHJcbiAgICAgIGVudHJ5OiAnbGFtYmRhL21vdmllcy9nZXRNb3ZpZXMudHMnLFxyXG4gICAgICBydW50aW1lOiBsYW1iZGEuUnVudGltZS5OT0RFSlNfMThfWCxcclxuICAgICAgaGFuZGxlcjogJ2hhbmRsZXInLFxyXG4gICAgICBlbnZpcm9ubWVudDoge1xyXG4gICAgICAgIFRBQkxFX05BTUU6IG1vdmllc1RhYmxlLnRhYmxlTmFtZSxcclxuICAgICAgfSxcclxuICAgIH0pO1xyXG5cclxuICAgIC8vR0VUIEJZIElEXHJcbiAgICBjb25zdCBnZXRNb3ZpZUJ5SWRMYW1iZGEgPSBuZXcgbGFtYmRhTm9kZS5Ob2RlanNGdW5jdGlvbih0aGlzLCBcIkdldE1vdmllQnlJZExhbWJkYVwiLCB7XHJcbiAgICAgIGVudHJ5OiBcImxhbWJkYS9tb3ZpZXMvZ2V0TW92aWVCeUlkLnRzXCIsXHJcbiAgICAgIHJ1bnRpbWU6IGxhbWJkYS5SdW50aW1lLk5PREVKU18xOF9YLFxyXG4gICAgICBoYW5kbGVyOiBcImhhbmRsZXJcIixcclxuICAgICAgZW52aXJvbm1lbnQ6IHtUQUJMRV9OQU1FOiBtb3ZpZXNUYWJsZS50YWJsZU5hbWV9LFxyXG4gICAgfSk7XHJcblxyXG4gICAgLy8gQUREIFxyXG4gICAgY29uc3QgYWRkTW92aWVMYW1iZGEgPSBuZXcgbGFtYmRhTm9kZS5Ob2RlanNGdW5jdGlvbih0aGlzLCAnQWRkTW92aWVMYW1iZGEnLCB7XHJcbiAgICAgIGVudHJ5OiAnbGFtYmRhL21vdmllcy9hZGRNb3ZpZS50cycsXHJcbiAgICAgIHJ1bnRpbWU6IGxhbWJkYS5SdW50aW1lLk5PREVKU18xOF9YLFxyXG4gICAgICBoYW5kbGVyOiAnaGFuZGxlcicsXHJcbiAgICAgIGVudmlyb25tZW50OiB7XHJcbiAgICAgICAgVEFCTEVfTkFNRTogbW92aWVzVGFibGUudGFibGVOYW1lLFxyXG4gICAgICB9LFxyXG4gICAgfSk7XHJcblxyXG4gICAgLy9ERUxFVEVcclxuICAgIGNvbnN0IGRlbGV0ZU1vdmllTGFtYmRhID0gbmV3IGxhbWJkYU5vZGUuTm9kZWpzRnVuY3Rpb24odGhpcywgXCJEZWxldGVNb3ZpZUxhbWJkYVwiLCB7XHJcbiAgICAgIGVudHJ5OiBcImxhbWJkYS9tb3ZpZXMvZGVsZXRlTW92aWUudHNcIixcclxuICAgICAgcnVudGltZTogbGFtYmRhLlJ1bnRpbWUuTk9ERUpTXzE4X1gsXHJcbiAgICAgIGhhbmRsZXI6IFwiaGFuZGxlclwiLFxyXG4gICAgICBlbnZpcm9ubWVudDoge1RBQkxFX05BTUU6IG1vdmllc1RhYmxlLnRhYmxlTmFtZX0sXHJcbiAgICB9KTtcclxuXHJcbiAgICAvL0FDVE9SU1xyXG4gICAgY29uc3QgZ2V0QWN0b3JzTGFtYmRhID0gbmV3IGxhbWJkYU5vZGUuTm9kZWpzRnVuY3Rpb24odGhpcywgXCJHZXRBY3RvcnNMYW1iZGFcIiwge1xyXG4gICAgICBlbnRyeTogXCJsYW1iZGEvYWN0b3JzL2dldEFjdG9ycy50c1wiLFxyXG4gICAgICBydW50aW1lOiBsYW1iZGEuUnVudGltZS5OT0RFSlNfMThfWCxcclxuICAgICAgaGFuZGxlcjogXCJoYW5kbGVyXCIsXHJcbiAgICAgIGVudmlyb25tZW50OiB7VEFCTEVfTkFNRTogbW92aWVzVGFibGUudGFibGVOYW1lfSxcclxuICAgIH0pO1xyXG5cclxuICAgICBjb25zdCBhZGRBY3RvcnNMYW1iZGEgPSBuZXcgbGFtYmRhTm9kZS5Ob2RlanNGdW5jdGlvbih0aGlzLCBcIkFkZEFjdG9yc0xhbWJkYVwiLCB7XHJcbiAgICAgIGVudHJ5OiBcImxhbWJkYS9hY3RvcnMvYWRkQWN0b3IudHNcIixcclxuICAgICAgcnVudGltZTogbGFtYmRhLlJ1bnRpbWUuTk9ERUpTXzE4X1gsXHJcbiAgICAgIGhhbmRsZXI6IFwiaGFuZGxlclwiLFxyXG4gICAgICBlbnZpcm9ubWVudDoge1RBQkxFX05BTUU6IG1vdmllc1RhYmxlLnRhYmxlTmFtZX0sXHJcbiAgICB9KTtcclxuXHJcbiAgICAvL0FXQVJEU1xyXG4gICAgY29uc3QgZ2V0QXdhcmRzTGFtYmRhID0gbmV3IGxhbWJkYU5vZGUuTm9kZWpzRnVuY3Rpb24odGhpcywgXCJHZXRBd2FyZHNMYW1iZGFcIiwge1xyXG4gICAgICBlbnRyeTogXCJsYW1iZGEvYXdhcmRzL2dldEF3YXJkcy50c1wiLFxyXG4gICAgICBydW50aW1lOiBsYW1iZGEuUnVudGltZS5OT0RFSlNfMThfWCxcclxuICAgICAgaGFuZGxlcjogXCJoYW5kbGVyXCIsXHJcbiAgICAgIGVudmlyb25tZW50OiB7VEFCTEVfTkFNRTogbW92aWVzVGFibGUudGFibGVOYW1lfSxcclxuICAgIH0pO1xyXG5cclxuICAgIC8vQ0FTVCBieSBtb3ZpZVxyXG4gIGNvbnN0IGdldENhc3RCeU1vdmllTGFtYmRhID0gbmV3IGxhbWJkYU5vZGUuTm9kZWpzRnVuY3Rpb24odGhpcywgXCJHZXRDYXN0QnlNb3ZpZUxhbWJkYVwiLCB7XHJcbiAgICBlbnRyeTogXCJsYW1iZGEvY2FzdC9nZXRDYXN0QnlNb3ZpZS50c1wiLFxyXG4gICAgcnVudGltZTogbGFtYmRhLlJ1bnRpbWUuTk9ERUpTXzE4X1gsXHJcbiAgICBoYW5kbGVyOiBcImhhbmRsZXJcIixcclxuICAgIGVudmlyb25tZW50OiB7IFRBQkxFX05BTUU6IG1vdmllc1RhYmxlLnRhYmxlTmFtZSB9LFxyXG4gIH0pO1xyXG5cclxuICAvL0FDVE9SIGluIG1vdmllXHJcbiAgY29uc3QgZ2V0QWN0b3JJbk1vdmllTGFtYmRhID0gbmV3IGxhbWJkYU5vZGUuTm9kZWpzRnVuY3Rpb24odGhpcywgXCJHZXRBY3RvckluTW92aWVMYW1iZGFcIiwge1xyXG4gICAgZW50cnk6IFwibGFtYmRhL2Nhc3QvZ2V0QWN0b3JJbk1vdmllLnRzXCIsXHJcbiAgICBydW50aW1lOiBsYW1iZGEuUnVudGltZS5OT0RFSlNfMThfWCxcclxuICAgIGhhbmRsZXI6IFwiaGFuZGxlclwiLFxyXG4gICAgZW52aXJvbm1lbnQ6IHsgVEFCTEVfTkFNRTogbW92aWVzVGFibGUudGFibGVOYW1lIH0sXHJcbiAgfSk7XHJcblxyXG5cclxuXHJcbiAgICAvL1BFUk1JU1NJT05TXHJcbiAgICBtb3ZpZXNUYWJsZS5ncmFudFJlYWREYXRhKGdldE1vdmllc0xhbWJkYSk7XHJcbiAgICBtb3ZpZXNUYWJsZS5ncmFudFJlYWRXcml0ZURhdGEoYWRkTW92aWVMYW1iZGEpO1xyXG4gICAgbW92aWVzVGFibGUuZ3JhbnRSZWFkRGF0YShnZXRNb3ZpZUJ5SWRMYW1iZGEpO1xyXG4gICAgbW92aWVzVGFibGUuZ3JhbnRSZWFkV3JpdGVEYXRhKGRlbGV0ZU1vdmllTGFtYmRhKTtcclxuICAgIG1vdmllc1RhYmxlLmdyYW50UmVhZERhdGEoZ2V0QWN0b3JzTGFtYmRhKTtcclxuICAgIG1vdmllc1RhYmxlLmdyYW50UmVhZFdyaXRlRGF0YShhZGRBY3RvcnNMYW1iZGEpO1xyXG4gICAgbW92aWVzVGFibGUuZ3JhbnRSZWFkRGF0YShnZXRBd2FyZHNMYW1iZGEpO1xyXG4gICAgbW92aWVzVGFibGUuZ3JhbnRSZWFkRGF0YShnZXRDYXN0QnlNb3ZpZUxhbWJkYSk7XHJcbiAgICBtb3ZpZXNUYWJsZS5ncmFudFJlYWREYXRhKGdldEFjdG9ySW5Nb3ZpZUxhbWJkYSk7XHJcblxyXG5cclxuXHJcbi8vIEFQSVxyXG5jb25zdCBhcGkgPSBuZXcgYXBpZ2F0ZXdheS5SZXN0QXBpKHRoaXMsIFwiTW92aWVzQXBpXCIsIHtcclxuICByZXN0QXBpTmFtZTogXCJNb3ZpZXMgU2VydmljZVwiLFxyXG4gIGRlc2NyaXB0aW9uOiBcIkFQSSBmb3IgbWFuYWdpbmcgbW92aWUgaW5mb3JtYXRpb24uXCIsXHJcbn0pO1xyXG5cclxuXHJcblxyXG4vLyAvbW92aWVzXHJcbmNvbnN0IG1vdmllcyA9IGFwaS5yb290LmFkZFJlc291cmNlKFwibW92aWVzXCIpO1xyXG5tb3ZpZXMuYWRkTWV0aG9kKFwiR0VUXCIsIG5ldyBhcGlnYXRld2F5LkxhbWJkYUludGVncmF0aW9uKGdldE1vdmllc0xhbWJkYSksIHtcclxufSk7XHJcblxyXG5tb3ZpZXMuYWRkTWV0aG9kKFwiUE9TVFwiLCBuZXcgYXBpZ2F0ZXdheS5MYW1iZGFJbnRlZ3JhdGlvbihhZGRNb3ZpZUxhbWJkYSksIHtcclxufSk7XHJcblxyXG5cclxuLy8gL21vdmllcy97aWR9XHJcbmNvbnN0IG1vdmllQnlJZCA9IG1vdmllcy5hZGRSZXNvdXJjZShcIntpZH1cIik7XHJcbm1vdmllQnlJZC5hZGRNZXRob2QoXCJHRVRcIiwgbmV3IGFwaWdhdGV3YXkuTGFtYmRhSW50ZWdyYXRpb24oZ2V0TW92aWVCeUlkTGFtYmRhKSwge1xyXG59KTtcclxubW92aWVCeUlkLmFkZE1ldGhvZChcIkRFTEVURVwiLCBuZXcgYXBpZ2F0ZXdheS5MYW1iZGFJbnRlZ3JhdGlvbihkZWxldGVNb3ZpZUxhbWJkYSksIHtcclxufSk7XHJcblxyXG4vLyAvYWN0b3JzXHJcbmNvbnN0IGFjdG9ycyA9IGFwaS5yb290LmFkZFJlc291cmNlKFwiYWN0b3JzXCIpO1xyXG5hY3RvcnMuYWRkTWV0aG9kKFwiR0VUXCIsIG5ldyBhcGlnYXRld2F5LkxhbWJkYUludGVncmF0aW9uKGdldEFjdG9yc0xhbWJkYSksIHtcclxuICBcclxufSk7XHJcbmFjdG9ycy5hZGRNZXRob2QoXCJQT1NUXCIsIG5ldyBhcGlnYXRld2F5LkxhbWJkYUludGVncmF0aW9uKGFkZEFjdG9yc0xhbWJkYSksIHtcclxufSk7XHJcblxyXG4vLyAvYXdhcmRzXHJcbmNvbnN0IGF3YXJkcyA9IGFwaS5yb290LmFkZFJlc291cmNlKFwiYXdhcmRzXCIpO1xyXG5hd2FyZHMuYWRkTWV0aG9kKFwiR0VUXCIsIG5ldyBhcGlnYXRld2F5LkxhbWJkYUludGVncmF0aW9uKGdldEF3YXJkc0xhbWJkYSksIHtcclxuIFxyXG59KTtcclxuXHJcbi8vIC9tb3ZpZXMve2lkfS9hY3RvcnNcclxuY29uc3QgYWN0b3JzSW5Nb3ZpZSA9IG1vdmllQnlJZC5hZGRSZXNvdXJjZShcImFjdG9yc1wiKTtcclxuYWN0b3JzSW5Nb3ZpZS5hZGRNZXRob2QoXCJHRVRcIiwgbmV3IGFwaWdhdGV3YXkuTGFtYmRhSW50ZWdyYXRpb24oZ2V0Q2FzdEJ5TW92aWVMYW1iZGEpLCB7XHJcbiBcclxufSk7XHJcblxyXG4vLyAvbW92aWVzL3tpZH0vYWN0b3JzL3thY3RvcklkfVxyXG5jb25zdCBzcGVjaWZpY0FjdG9yID0gYWN0b3JzSW5Nb3ZpZS5hZGRSZXNvdXJjZShcInthY3RvcklkfVwiKTtcclxuc3BlY2lmaWNBY3Rvci5hZGRNZXRob2QoXCJHRVRcIiwgbmV3IGFwaWdhdGV3YXkuTGFtYmRhSW50ZWdyYXRpb24oZ2V0QWN0b3JJbk1vdmllTGFtYmRhKSwge1xyXG4gXHJcbn0pO1xyXG5cclxuXHJcbi8vIE91dHB1dCB0aGUgQVBJIFVSTFxyXG5uZXcgY2RrLkNmbk91dHB1dCh0aGlzLCBcIkFwaVVybFwiLCB7IHZhbHVlOiBhcGkudXJsID8/IFwiTm8gVVJMIHJldHVybmVkXCIgfSk7XHJcbiAgfVxyXG59XHJcbiJdfQ==