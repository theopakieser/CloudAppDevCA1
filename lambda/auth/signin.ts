import {
  CognitoIdentityProviderClient,
  InitiateAuthCommand,
} from "@aws-sdk/client-cognito-identity-provider";

const client = new CognitoIdentityProviderClient({ region: process.env.REGION });

export const handler = async (event: any) => {
  try {
    const body = JSON.parse(event.body);
    const { email, password } = body;

    const cmd = new InitiateAuthCommand({
      AuthFlow: "USER_PASSWORD_AUTH",
      ClientId: process.env.CLIENT_ID!,
      AuthParameters: { USERNAME: email, PASSWORD: password },
    });

    const res = await client.send(cmd);
    return {
      statusCode: 200,
      body: JSON.stringify({
        message: "Signin successful",
        accessToken: res.AuthenticationResult?.AccessToken,
        idToken: res.AuthenticationResult?.IdToken,
        refreshToken: res.AuthenticationResult?.RefreshToken,
      }),
    };
  } catch (err: any) {
    console.error("Signin error:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message }),
    };
  }
};
