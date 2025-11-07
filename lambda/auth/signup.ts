import {
  CognitoIdentityProviderClient,
  SignUpCommand,
} from "@aws-sdk/client-cognito-identity-provider";

const client = new CognitoIdentityProviderClient({ region: process.env.REGION });

export const handler = async (event: any) => {
  try {
    const body = JSON.parse(event.body);
    const { email, password } = body;

    const cmd = new SignUpCommand({
      ClientId: process.env.CLIENT_ID!,
      Username: email,
      Password: password,
      UserAttributes: [{ Name: "email", Value: email }],
    });

    const res = await client.send(cmd);
    return {
      statusCode: 200,
      body: JSON.stringify({ message: "Signup successful", userSub: res.UserSub }),
    };
  } catch (err: any) {
    console.error("Signup error:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message }),
    };
  }
};
