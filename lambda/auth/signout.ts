import {
  CognitoIdentityProviderClient,
  GlobalSignOutCommand,
} from "@aws-sdk/client-cognito-identity-provider";

const client = new CognitoIdentityProviderClient({ region: process.env.REGION });

export const handler = async (event: any) => {
  try {
    const authHeader = event.headers.Authorization || event.headers.authorization;
    if (!authHeader) {
      return { statusCode: 400, body: JSON.stringify({ error: "Missing Authorization header" }) };
    }

    const token = authHeader.replace("Bearer ", "");

    const cmd = new GlobalSignOutCommand({ AccessToken: token });
    await client.send(cmd);

    return {
      statusCode: 200,
      body: JSON.stringify({ message: "Signout successful" }),
    };
  } catch (err: any) {
    console.error("Signout error:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message }),
    };
  }
};
