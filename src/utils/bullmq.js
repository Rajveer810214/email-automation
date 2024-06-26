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
Object.defineProperty(exports, "__esModule", { value: true });
exports.worker = exports.emailQueue = void 0;
const bullmq_1 = require("bullmq");
const emailService_1 = require("../services/emailService");
const openAIService_1 = require("../services/openAIService");
const gmailAuth_1 = require("../auth/gmailAuth");
const outlookAuth_1 = require("../auth/outlookAuth");
exports.emailQueue = new bullmq_1.Queue('emailQueue');
// Consumer
exports.worker = new bullmq_1.Worker('emailQueue', (job) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const { emailType, emailData, tokens } = job.data;
    if (emailType === 'gmail') {
        const gmailClient = (0, gmailAuth_1.getGmailClient)();
        const emails = yield (0, emailService_1.fetchEmailsFromGmail)(gmailClient);
        for (const email of emails) {
            const context = yield (0, openAIService_1.analyzeEmail)(email.snippet);
            const reply = yield (0, openAIService_1.generateReply)(email.snippet);
            yield (0, emailService_1.sendGmailReply)(gmailClient, (_a = email.payload.headers.find((header) => header.name === 'From')) === null || _a === void 0 ? void 0 : _a.value, `Re: ${(_b = email.payload.headers.find((header) => header.name === 'Subject')) === null || _b === void 0 ? void 0 : _b.value}`, reply);
        }
    }
    else if (emailType === 'outlook') {
        const accessToken = yield (0, outlookAuth_1.getOutlookTokens)(tokens.code);
        const emails = yield (0, emailService_1.fetchEmailsFromOutlook)(accessToken);
        for (const email of emails) {
            const context = yield (0, openAIService_1.analyzeEmail)(email.body.content);
            const reply = yield (0, openAIService_1.generateReply)(email.body.content);
            yield (0, emailService_1.sendOutlookReply)(accessToken, email.from.emailAddress.address, `Re: ${email.subject}`, reply);
        }
    }
}));
