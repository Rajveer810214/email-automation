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
exports.generateReply = exports.analyzeEmail = void 0;
const openai_1 = __importDefault(require("openai"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const openai = new openai_1.default({
    apiKey: process.env.OPENAI_SECRECT_KEY
});
const analyzeEmail = (emailText) => __awaiter(void 0, void 0, void 0, function* () {
    const response = yield openai.completions.create({
        model: 'text-davinci-003',
        prompt: `Analyze the context of this email and assign a label: ${emailText}`,
        max_tokens: 60
    });
    const label = response.choices[0].text.trim();
    return label;
});
exports.analyzeEmail = analyzeEmail;
const generateReply = (emailText) => __awaiter(void 0, void 0, void 0, function* () {
    const response = yield openai.completions.create({
        model: 'text-davinci-003',
        prompt: `Generate a polite and professional reply to this email: ${emailText}`,
        max_tokens: 150
    });
    const replyText = response.choices[0].text.trim();
    return replyText;
});
exports.generateReply = generateReply;
