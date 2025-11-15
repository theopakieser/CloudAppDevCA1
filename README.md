## Assignment - Cloud App Development.

__Name:__ Theo Pakieser

### Links.
__Demo:__ A link to your YouTube video demonstration.

### Screenshots.

![][api]


![][db]


### Design features (if required).
    - CloudAppCaStack – Defines the main Movies Service API, DynamoDB table, and all Lambda functions for CRUD operations.

The design uses a single-table DynamoDB model:
    - All entities (Movies, Actors, Cast, Awards) are stored in one table.
    - Each item’s partition key (pk) includes a type prefix (m, a, c, w).
    - Sort keys (sk) vary by entity type (e.g. xxxx, actor ID, or award body).

All AWS Lambda functions were implemented in TypeScript and use the AWS SDK v3 (@aws-sdk/client-dynamodb) with marshall/unmarshall utilities.


###  Extra (If relevant).

During development, the Lambda functions were originally written in plain JavaScript. This happened because I focused first on getting the API logic, DynamoDB integration, and testing working correctly. 

After reviewing the labs and assignment specifications, I realised the implementation was expected to use TypeScript. 

Since the AWS CDK automatically supports TypeScript compilation, I refactored all handlers to .ts files, added basic type definitions, and redeployed the stack to match the lab standards.

Originally, I did include Authentication, which worked up until the day I decided to record the demo. I don't know what broke but I was unable to fix it in time for the due date so, I had to cut it completely in order to produce something that worked.

[api]: ./images/api.png
[db]: ./images/db.png

