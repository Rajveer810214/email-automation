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
exports.getOutlookTokens = exports.getOutlookAuthUrl = void 0;
const msal_node_1 = require("@azure/msal-node");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const config = {
    auth: {
        clientId: process.env.AZURE_CLIENT_ID,
        authority: `https://login.microsoftonline.com/${process.env.AZURE_TENANT_ID}`,
        clientSecret: process.env.AZURE_CLIENT_SECRET
    }
};
const cca = new msal_node_1.ConfidentialClientApplication(config);
const getOutlookAuthUrl = () => __awaiter(void 0, void 0, void 0, function* () {
    return cca.getAuthCodeUrl({
        scopes: ['Mail.Read', 'Mail.Send'],
        redirectUri: process.env.GOOGLE_REDIRECT_URI
    });
});
exports.getOutlookAuthUrl = getOutlookAuthUrl;
const getOutlookTokens = (code) => __awaiter(void 0, void 0, void 0, function* () {
    const response = yield cca.acquireTokenByCode({
        code,
        scopes: ['Mail.Read', 'Mail.Send'],
        redirectUri: process.env.GOOGLE_REDIRECT_URI
    });
    return response.accessToken;
});
exports.getOutlookTokens = getOutlookTokens;
