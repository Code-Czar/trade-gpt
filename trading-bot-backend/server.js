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
const express = require('express');
const cors = require('cors');
const { TradingBot } = require('./src/bot');
// import { TradingBot } from './bot';
const bot = new TradingBot('binance');
const symbol = 'BTC/USDT';
const timeframe = '1m'; // 1 day
const app = express();
// Enable CORS
app.use(cors());
// Data store
let ohlcvData = [];
// Fetch new data every 1 minute
let count = 0;
setInterval(() => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const ohlcv = yield bot.fetchOHLCV(symbol, timeframe);
        console.log("🚀 ~ file: server.ts:19 ~ setInterval ~ ohlcv:", ohlcv);
        ohlcvData.push(ohlcv);
        count++;
        console.log(`Fetched ${count} data`);
    }
    catch (error) {
        console.error(error);
    }
}), 1 * 1000); // 1 seconds
app.get('/api/data', (req, res) => {
    res.json(ohlcvData);
});
app.listen(3000, () => {
    console.log('Server is running on http://localhost:3000');
});
