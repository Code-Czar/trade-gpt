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
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendSignalEmail = void 0;
// import dotenv from 'dotenv';
// import nodemailer from 'nodemailer';
var dotenv = require('dotenv');
var nodemailer = require('nodemailer');
dotenv.config();
var SEND_SIGNAL = false;
var tradingViewUrl = "https://www.tradingview.com/chart/?symbol=";
var bybitURL = "https://www.bybit.com/trade/usdt/";
function sendSignalEmail(positionType, symbol, timeFrame, analysisType, sendSignal, exchange) {
    if (sendSignal === void 0) { sendSignal = SEND_SIGNAL; }
    if (exchange === void 0) { exchange = "BINANCE"; }
    return __awaiter(this, void 0, void 0, function () {
        var credentials, transporter, formattedSymbol, info;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!sendSignal)
                        return [2 /*return*/];
                    credentials = {
                        user: process.env.GMAIL_USER,
                        pass: process.env.GMAIL_PASS // your Gmail App Password
                    };
                    transporter = nodemailer.createTransport({
                        service: 'gmail',
                        auth: credentials
                    });
                    formattedSymbol = symbol.replace("/", "").replace("-", "");
                    return [4 /*yield*/, transporter.sendMail({
                            from: "\"Benjamin Tourrette\" <".concat(process.env.GMAIL_USER, ">"),
                            to: process.env.GMAIL_USER,
                            subject: "Trading signal for ".concat(timeFrame, " on ").concat(analysisType),
                            text: "A ".concat(symbol, " | ").concat(positionType, "signal was generated for ").concat(timeFrame, " on ").concat(analysisType, "."),
                            html: "<p>A <strong>".concat(symbol, " | ").concat(positionType, " </strong> signal was generated for <strong>").concat(timeFrame, "</strong> on <strong>").concat(analysisType, "</strong>.</p><br/> \n        <a href=\"").concat(tradingViewUrl).concat(exchange, ":").concat(formattedSymbol, "\"> View on trading view </a>\n        <a href=\"").concat(bybitURL).concat(formattedSymbol, "\"> View on Bybit </a>"), // html body
                        })];
                case 1:
                    info = _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
exports.sendSignalEmail = sendSignalEmail;
