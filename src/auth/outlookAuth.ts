import { ConfidentialClientApplication } from '@azure/msal-node';
import dotenv from 'dotenv';

dotenv.config();

const config = {
  auth: {
    clientId: process.env.AZURE_CLIENT_ID!,
    authority: `https://login.microsoftonline.com/${process.env.AZURE_TENANT_ID!}`,
    clientSecret: process.env.AZURE_CLIENT_SECRET!
  }
};

const cca = new ConfidentialClientApplication(config);

export const getOutlookAuthUrl = async () => {
  return cca.getAuthCodeUrl({
    scopes: ['Mail.Read', 'Mail.Send'],
    redirectUri: process.env.AZURE_REDIRECT_URI!
  });
};

export const getOutlookTokens = async (code: string) => {
  const response = await cca.acquireTokenByCode({
    code,
    scopes: ['Mail.Read', 'Mail.Send'],
    redirectUri: process.env.AZURE_REDIRECT_URI!
  });

  return response.accessToken;
};
