"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.worker = exports.emailQueue = void 0;
const bullmq_1 = require("bullmq");
const emailService_1 = require("../services/emailService");
const gmailAuth_1 = require("../auth/gmailAuth");
const outlookAuth_1 = require("../auth/outlookAuth");
const generative_ai_1 = require("@google/generative-ai");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const redisConnection = {
    host: 'localhost',
    port: 6379,
};
exports.emailQueue = new bullmq_1.Queue('emailQueue', { connection: redisConnection });
exports.worker = new bullmq_1.Worker('emailQueue', (job) => __awaiter(void 0, void 0, void 0, function* () {
    const { emailType, tokens } = job.data;
    console.log('Email Type:', emailType);
    console.log('Tokens:', tokens);
    if (emailType === 'gmail') {
        const gmailClient = (0, gmailAuth_1.getGmailClient)();
        const emails = yield (0, emailService_1.fetchEmailsFromGmail)(gmailClient);
        for (const email of emails) {
            const headers = email.payload.headers;
            let senderEmail = '';
            let senderName = '';
            let subject = '';
            headers.forEach((header) => {
                if (header.name === 'From') {
                    const senderInfo = header.value.split(' <');
                    senderEmail = senderInfo[senderInfo.length - 1].replace('>', '');
                    senderName = senderInfo[0];
                }
                else if (header.name === 'Subject') {
                    subject = header.value;
                }
            });
            // Analyze email content to generate a response
            const analyzedMessage = yield analyzeEmailContent(email);
            if (analyzedMessage !== null) {
                // Send response email
                const responseEmailSubject = 'Response to your email';
                const responseBody = `Dear ${senderName},\n\nYour email with subject "${subject}" has been received.\n\n${analyzedMessage}`;
                try {
                    yield (0, emailService_1.sendGmailReply)(gmailClient, senderEmail, responseEmailSubject, responseBody);
                    console.log(`Response sent to ${senderEmail}`);
                }
                catch (error) {
                    console.error('Error sending response email:', error);
                }
                console.log('Sender Name:', senderName);
                console.log('Sender Email:', senderEmail);
                console.log('Subject:', subject);
                console.log('Analyzed Message:', analyzedMessage);
            }
            else {
                console.error('Error analyzing email content: Analyzed message is null');
            }
        }
    }
    else if (emailType === 'outlook') {
        if (!tokens || !tokens.code) {
            console.error('Tokens or tokens.code is undefined');
            return;
        }
        try {
            console.log('Tokens:', tokens);
            const accessToken = yield (0, outlookAuth_1.getOutlookTokens)(tokens.code);
            console.log('Access Token:', accessToken);
            if (!accessToken) {
                throw new Error('Failed to retrieve access token');
            }
            const emails = yield (0, emailService_1.fetchEmailsFromOutlook)(accessToken);
            for (const email of emails) {
                const headers = email.internetMessageHeaders;
                let senderEmail = '';
                let senderName = '';
                let subject = '';
                headers.forEach((header) => {
                    if (header.name === 'From') {
                        const senderInfo = header.value.split(' <');
                        senderEmail = senderInfo[senderInfo.length - 1].replace('>', '');
                        senderName = senderInfo[0];
                    }
                    else if (header.name === 'Subject') {
                        subject = header.value;
                    }
                });
                // Analyze email content to generate a response
                const analyzedMessage = yield analyzeEmailContent(email);
                if (analyzedMessage !== null) {
                    // Send response email
                    const responseEmailSubject = 'Response to your email';
                    const responseBody = `Dear ${senderName},\n\nYour email with subject "${subject}" has been received.\n\n${analyzedMessage}`;
                    try {
                        yield (0, emailService_1.sendOutlookReply)(accessToken, senderEmail, responseEmailSubject, responseBody);
                        console.log(`Response sent to ${senderEmail}`);
                    }
                    catch (error) {
                        console.error('Error sending response email:', error);
                    }
                    console.log('Sender Name:', senderName);
                    console.log('Sender Email:', senderEmail);
                    console.log('Subject:', subject);
                    console.log('Analyzed Message:', analyzedMessage);
                }
                else {
                    console.error('Error analyzing email content: Analyzed message is null');
                }
            }
        }
        catch (error) {
            console.error('Error fetching access token:', error);
        }
    }
}), { connection: redisConnection });
const analyzeEmailContent = (email) => __awaiter(void 0, void 0, void 0, function* () {
    const genAI = new generative_ai_1.GoogleGenerativeAI(process.env.GEMINI_API_KEY); // Add non-null assertion
    try {
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
        const result = yield model.generateContent(email.snippet); // Use email snippet for analysis
        const response = result.response;
        const text = yield response.text();
        if (text) {
            return text.trim();
        }
        else {
            console.error('Error analyzing email content: Response format is unexpected');
            return null;
        }
    }
    catch (error) {
        if (error instanceof Error) {
            console.error('Error analyzing email content:', error.message);
        }
        else {
            console.error('Error analyzing email content:', error);
        }
        return null;
    }
});
