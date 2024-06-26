import express from 'express';
import dotenv from 'dotenv';
import { emailQueue } from './utils/bullmq';
import { getGmailAuthUrl, getGmailTokens } from './auth/gmailAuth';
import { getOutlookAuthUrl } from './auth/outlookAuth';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.get('/auth/gmail', (req, res) => {
  const url = getGmailAuthUrl();
  res.redirect(url);
});

app.get('/auth/gmail/callback', async (req, res) => {
  try {
    const { code } = req.query;
    const tokens = await getGmailTokens(code as string);
    await emailQueue.add('emailJob', { emailType: 'gmail', tokens });
    res.send('Gmail authenticated and email task scheduled.');
  } catch (error) {
    res.status(500).send('Error during Gmail authentication.');
  }
});

app.get('/auth/outlook', async (req, res) => {
  try {
    const url = await getOutlookAuthUrl();
    res.redirect(url);
  } catch (error) {
    res.status(500).send('Error getting Outlook authentication URL.');
  }
});

app.get('/auth/outlook/callback', async (req, res) => {
  try {
    const { code } = req.query;
    await emailQueue.add('emailJob', { emailType: 'outlook', code });
    res.send('Outlook authenticated and email task scheduled.');
  } catch (error) {
    res.status(500).send('Error during Outlook authentication.');
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
