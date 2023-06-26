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
const dotenv_1 = __importDefault(require("dotenv"));
const nodemailer_1 = __importDefault(require("nodemailer"));
dotenv_1.default.config();
const tradingViewUrl = "https://www.tradingview.com/chart/?symbol=";
function sendSignalEmail(positionType, symbol, timeFrame, analysisType, exchange = "BINANCE") {
    return __awaiter(this, void 0, void 0, function* () {
        const credentials = {
            user: process.env.GMAIL_USER,
            pass: process.env.GMAIL_PASS // your Gmail App Password
        };
        let transporter = nodemailer_1.default.createTransport({
            service: 'gmail',
            auth: credentials
        });
        console.log("🚀 ~ file: email.ts:14 ~ sendSignalEmail ~ auth:", credentials);
        const formattedSymbol = symbol.replace("/", "").replace("-", "");
        // send mail with defined transport object
        let info = yield transporter.sendMail({
            from: `"Benjamin Tourrette" <${process.env.GMAIL_USER}>`,
            to: process.env.GMAIL_USER,
            subject: `Trading signal for ${timeFrame} on ${analysisType}`,
            text: `A ${symbol} | ${positionType}signal was generated for ${timeFrame} on ${analysisType}.`,
            html: `<p>A <strong>${symbol} | ${positionType} </strong> signal was generated for <strong>${timeFrame}</strong> on <strong>${analysisType}</strong>.</p><br/> <a href="${tradingViewUrl}${exchange}:${formattedSymbol}"> View on trading view </a>`, // html body
        });
        console.log('Message sent: %s', info.messageId);
    });
}
exports.sendSignalEmail = sendSignalEmail;
