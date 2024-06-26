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
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const bullmq_1 = require("./utils/bullmq");
const gmailAuth_1 = require("./auth/gmailAuth");
const outlookAuth_1 = require("./auth/outlookAuth");
dotenv_1.default.config();
const app = (0, express_1.default)();
const port = process.env.PORT || 3000;
app.get('/auth/gmail', (req, res) => {
    const url = (0, gmailAuth_1.getGmailAuthUrl)();
    res.redirect(url);
});
app.get('/auth/gmail/callback', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { code } = req.query;
    const tokens = yield (0, gmailAuth_1.getGmailTokens)(code);
    yield bullmq_1.emailQueue.add('gmail', { emailType: 'gmail', tokens });
    res.send('Gmail authenticated and email task scheduled.');
}));
app.get('/auth/outlook', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const url = yield (0, outlookAuth_1.getOutlookAuthUrl)();
    res.redirect(url);
}));
app.get('/auth/outlook/callback', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { code } = req.query;
    yield bullmq_1.emailQueue.add('outlook', { emailType: 'outlook', tokens: { code } });
    res.send('Outlook authenticated and email task scheduled.');
}));
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
