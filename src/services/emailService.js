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
exports.sendOutlookReply = exports.sendGmailReply = exports.fetchEmailsFromOutlook = exports.fetchEmailsFromGmail = void 0;
const microsoft_graph_client_1 = require("@microsoft/microsoft-graph-client");
const fetchEmailsFromGmail = (gmailClient) => __awaiter(void 0, void 0, void 0, function* () {
    const res = yield gmailClient.users.messages.list({ userId: 'me' });
    const messages = res.data.messages;
    const emails = [];
    for (const message of messages) {
        const msg = yield gmailClient.users.messages.get({ userId: 'me', id: message.id });
        emails.push(msg.data);
    }
    return emails;
});
exports.fetchEmailsFromGmail = fetchEmailsFromGmail;
const fetchEmailsFromOutlook = (accessToken) => __awaiter(void 0, void 0, void 0, function* () {
    const client = microsoft_graph_client_1.Client.init({
        authProvider: (done) => {
            done(null, accessToken);
        }
    });
    const res = yield client.api('/me/messages').get();
    return res.value;
});
exports.fetchEmailsFromOutlook = fetchEmailsFromOutlook;
const sendGmailReply = (gmailClient, to, subject, body) => __awaiter(void 0, void 0, void 0, function* () {
    const raw = `To: ${to}\r\nSubject: ${subject}\r\n\r\n${body}`;
    yield gmailClient.users.messages.send({
        userId: 'me',
        requestBody: {
            raw: Buffer.from(raw).toString('base64').replace(/\+/g, '-').replace(/\//g, '_')
        }
    });
});
exports.sendGmailReply = sendGmailReply;
const sendOutlookReply = (accessToken, to, subject, body) => __awaiter(void 0, void 0, void 0, function* () {
    const client = microsoft_graph_client_1.Client.init({
        authProvider: (done) => {
            done(null, accessToken);
        }
    });
    yield client.api('/me/sendMail').post({
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
});
exports.sendOutlookReply = sendOutlookReply;
