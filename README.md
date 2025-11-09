## Assignment - Cloud App Development.

__Name:__ ....your name .....

### Links.
__Demo:__ A link to your YouTube video demonstration.]

### Screenshots.

[A screenshot of the App Web API from the management console, e.g.

![][api]

The Auth API is not required as its code was provided in the labs.

]

[A screenshot of your seeded table from DynamoDB, e.g.

![][db]
]

[A screenshot from CloudWatch logs showing an example of User Activity logging, e.g.

jbloggs /awards?movie=1234&awardBody=Academy
]

### Design features (if required).

[Briefly explain any design features of the App API in terms of custom L2 constructs, multi-stack, and lambda layers.]

###  Extra (If relevant).

During development, the Lambda functions were originally written in plain JavaScript. This happened because I focused first on getting the API logic, DynamoDB integration, and testing working correctly. 

After reviewing the labs and assignment specifications, I realised the implementation was expected to use TypeScript. 

Since the AWS CDK automatically supports TypeScript compilation, I refactored all handlers to .ts files, added basic type definitions, and redeployed the stack to match the lab standards.

[api]: ./images/api.png
[db]: ./images/db.png
