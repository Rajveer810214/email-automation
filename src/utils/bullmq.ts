import { Queue, Worker, ConnectionOptions, Job } from 'bullmq';
import { fetchEmailsFromGmail, fetchEmailsFromOutlook, sendGmailReply, sendOutlookReply } from '../services/emailService';
import { getGmailClient } from '../auth/gmailAuth';
import { getOutlookTokens } from '../auth/outlookAuth';
import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

interface EmailHeader {
  name: string;
  value: string;
}

const redisConnection: ConnectionOptions = {
  host: 'localhost',
  port: 6379,
};

export const emailQueue = new Queue('emailQueue', { connection: redisConnection });

export const worker = new Worker(
  'emailQueue',
  async (job: Job<{ emailType: string, tokens?: any }>) => {
    const { emailType, tokens } = job.data;
    console.log('Email Type:', emailType);
    console.log('Tokens:', tokens);

    if (emailType === 'gmail') {
      const gmailClient = getGmailClient();
      const emails = await fetchEmailsFromGmail(gmailClient);

      for (const email of emails) {
        const headers = email.payload.headers;
        let senderEmail = '';
        let senderName = '';
        let subject = '';

        headers.forEach((header: EmailHeader) => {
          if (header.name === 'From') {
            const senderInfo = header.value.split(' <');
            senderEmail = senderInfo[senderInfo.length - 1].replace('>', '');
            senderName = senderInfo[0];
          } else if (header.name === 'Subject') {
            subject = header.value;
          }
        });

        // Analyze email content to generate a response
        const analyzedMessage = await analyzeEmailContent(email);

        if (analyzedMessage !== null) {
          // Send response email
          const responseEmailSubject = 'Response to your email';
          const responseBody = `Dear ${senderName},\n\nYour email with subject "${subject}" has been received.\n\n${analyzedMessage}`;

          try {
            await sendGmailReply(gmailClient, senderEmail, responseEmailSubject, responseBody);
            console.log(`Response sent to ${senderEmail}`);
          } catch (error) {
            console.error('Error sending response email:', error);
          }

          console.log('Sender Name:', senderName);
          console.log('Sender Email:', senderEmail);
          console.log('Subject:', subject);
          console.log('Analyzed Message:', analyzedMessage);
        } else {
          console.error('Error analyzing email content: Analyzed message is null');
        }
      }
    } else if (emailType === 'outlook') {
      if (!tokens || !tokens.code) {
        console.error('Tokens or tokens.code is undefined');
        return;
      }

      try {
        console.log('Tokens:', tokens);
        const accessToken = await getOutlookTokens(tokens.code);
        console.log('Access Token:', accessToken);

        if (!accessToken) {
          throw new Error('Failed to retrieve access token');
        }

        const emails = await fetchEmailsFromOutlook(accessToken);

        for (const email of emails) {
          const headers = email.internetMessageHeaders;
          let senderEmail = '';
          let senderName = '';
          let subject = '';

          headers.forEach((header: EmailHeader) => {
            if (header.name === 'From') {
              const senderInfo = header.value.split(' <');
              senderEmail = senderInfo[senderInfo.length - 1].replace('>', '');
              senderName = senderInfo[0];
            } else if (header.name === 'Subject') {
              subject = header.value;
            }
          });

          // Analyze email content to generate a response
          const analyzedMessage = await analyzeEmailContent(email);

          if (analyzedMessage !== null) {
            // Send response email
            const responseEmailSubject = 'Response to your email';
            const responseBody = `Dear ${senderName},\n\nYour email with subject "${subject}" has been received.\n\n${analyzedMessage}`;

            try {
              await sendOutlookReply(accessToken, senderEmail, responseEmailSubject, responseBody);
              console.log(`Response sent to ${senderEmail}`);
            } catch (error) {
              console.error('Error sending response email:', error);
            }

            console.log('Sender Name:', senderName);
            console.log('Sender Email:', senderEmail);
            console.log('Subject:', subject);
            console.log('Analyzed Message:', analyzedMessage);
          } else {
            console.error('Error analyzing email content: Analyzed message is null');
          }
        }
      } catch (error) {
        console.error('Error fetching access token:', error);
      }
    }
  },
  { connection: redisConnection }
);

const analyzeEmailContent = async (email: any) => {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!); // Add non-null assertion

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const result = await model.generateContent(email.snippet); // Use email snippet for analysis
    const response = result.response;
    const text = await response.text();

    if (text) {
      return text.trim();
    } else {
      console.error('Error analyzing email content: Response format is unexpected');
      return null;
    }
  } catch (error) {
    if (error instanceof Error) {
      console.error('Error analyzing email content:', error.message);
    } else {
      console.error('Error analyzing email content:', error);
    }
    return null;
  }
};
