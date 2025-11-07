import {
  CognitoIdentityProviderClient,
  ConfirmSignUpCommand,
} from "@aws-sdk/client-cognito-identity-provider";

const client = new CognitoIdentityProviderClient({ region: process.env.REGION });

export const handler = async (event: any) => {
  try {
    const body = JSON.parse(event.body);
    const { email, code } = body;

    const cmd = new ConfirmSignUpCommand({
      ClientId: process.env.CLIENT_ID!,
      Username: email,
      ConfirmationCode: code,
    });

    await client.send(cmd);
    return {
      statusCode: 200,
      body: JSON.stringify({ message: "Signup confirmed successfully" }),
    };
  } catch (err: any) {
    console.error("Confirm signup error:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message }),
    };
  }
};
