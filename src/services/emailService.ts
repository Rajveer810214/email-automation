import { Client } from '@microsoft/microsoft-graph-client';

export const fetchEmailsFromGmail = async (gmailClient: any) => {
  console.log("Fetching emails from Gmail...");
  const res = await gmailClient.users.messages.list({ userId: 'me' });
  const messages = res.data.messages;
  if (!messages) {
    console.log("No messages found.");
    return [];
  }
  const emails = [];
  for (const message of messages) {
    const msg = await gmailClient.users.messages.get({ userId: 'me', id: message.id });
    console.log(`Fetched email with ID: ${message.id}`);
    // console.log(JSON.stringify(msg.data, null, 2)); // Log the entire email object
    emails.push(msg.data);
  }
  return emails;
};

export const fetchEmailsFromOutlook = async (accessToken: string): Promise<any[]> => {
  try {
    const client = Client.init({
      authProvider: (done) => {
        done(null, accessToken);
      }
    });
    console.log("Fetching emails from Outlook...");
    const res = await client.api('/me/messages').get();
    console.log("Outlook API Response:", res);

    return res.value || [];
  } catch (error) {
    console.error("Error fetching emails from Outlook:", (error as Error).message);
    throw error;
  }
};
export const sendGmailReply = async (gmailClient: any, to: string, subject: string, body: string) => {
  const raw = `To: ${to}\r\nSubject: ${subject}\r\n\r\n${body}`;

  await gmailClient.users.messages.send({
    userId: 'me',
    requestBody: {
      raw: Buffer.from(raw).toString('base64').replace(/\+/g, '-').replace(/\//g, '_')
    }
  });
};
export const sendOutlookReply = async (accessToken: string, to: string, subject: string, body: string) => {
  const client = Client.init({
    authProvider: (done) => {
      done(null, accessToken);
    }
  });

  await client.api('/me/sendMail').post({
    message: {
      subject: subject,
      body: {
        contentType: 'Text',
        content: body
      },
      toRecipients: [
        {
          emailAddress: {
            address: to
          }
        }
      ]
    }
  });
};
