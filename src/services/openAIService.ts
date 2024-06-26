import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_SECRECT_KEY
});

export const analyzeEmail = async (emailText: string) => {
  const response = await openai.completions.create({
    model: 'text-davinci-003',
    prompt: `Analyze the context of this email and assign a label: ${emailText}`,
    max_tokens: 60
  });

  const label = response.choices[0].text.trim();
  return label;
};

export const generateReply = async (emailText: string) => {
  const response = await openai.completions.create({
    model: 'text-davinci-003',
    prompt: `Generate a polite and professional reply to this email: ${emailText}`,
    max_tokens: 150
  });

  const replyText = response.choices[0].text.trim();
  return replyText;
};
