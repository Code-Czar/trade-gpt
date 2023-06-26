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
exports.sendSignalEmail = void 0;
// const nodemailer = require('nodemailer');
const mail_1 = __importDefault(require("@sendgrid/mail"));
const dotenv_1 = __importDefault(require("dotenv"));
// Load environment variables from .env file
dotenv_1.default.config();
mail_1.default.setApiKey(process.env.SENDGRID_API_KEY);
function sendSignalEmail(signal, symbol, timeframe) {
    return __awaiter(this, void 0, void 0, function* () {
        const msg = {
            to: 'contact@benjamintourrette.com',
            from: 'contact@benjamintourrette.com',
            subject: `Trading signal for ${symbol} on ${timeframe}`,
            text: `A ${signal} signal was generated for ${symbol} on ${timeframe}.`,
            html: `<p>A <strong>${signal}</strong> signal was generated for <strong>${symbol}</strong> on <strong>${timeframe}</strong>.</p>`,
        };
        try {
            yield mail_1.default.send(msg);
            console.log(`Email sent to ${msg.to}`);
        }
        catch (error) {
            console.error(`Failed to send email:`, error);
        }
    });
}
exports.sendSignalEmail = sendSignalEmail;
