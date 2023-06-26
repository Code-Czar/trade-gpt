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
const bot = new TradingBot('binance');
const symbol = 'BTC/USDT';
const timeframe = '1m'; // 1 day
const app = express();
// Enable CORS
app.use(cors());
// Data store
let ohlcvData = null;
// Fetch new data every 1 minute
let count = 0;
// setInterval(async () => {
//     try {
//         const ohlcv = await bot.fetchOHLCV(symbol, timeframe);
//         ohlcvData = ohlcv;
//         count++;
//         console.log(`Fetched ${count} data`);
//         console.log(`Size ${ohlcvData.length} data`);
//     } catch (error) {
//         console.error(error);
//     }
// }, 2 * 1000);  // 1 seconds
app.get('/api/data/:symbol/:timeframe', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let { symbol, timeframe } = req.params;
    symbol = symbol.replace('-', '/');
    try {
        const ohlcvs = yield bot.fetchOHLCV(symbol, timeframe);
        res.json(ohlcvs);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error fetching data' });
    }
}));
app.get('/bollinger-bands/:symbol/:timeframe', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let { symbol, timeframe } = req.params;
    symbol = symbol.replace('-', '/');
    const ohlcv = yield bot.fetchOHLCV(symbol, timeframe);
    const bollingerBands = bot.calculateBollingerBands(ohlcv);
    res.send(bollingerBands);
}));
app.get('/rsi/:symbol/:timeframe', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let { symbol, timeframe } = req.params;
    symbol = symbol.replace('-', '/');
    const ohlcv = yield bot.fetchOHLCV(symbol, timeframe);
    const rsi = bot.calculateRSI(ohlcv);
    res.send(rsi);
}));
app.get('/macd/:symbol/:timeframe', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let { symbol, timeframe } = req.params;
    symbol = symbol.replace('-', '/');
    const ohlcv = yield bot.fetchOHLCV(symbol, timeframe);
    const macd = bot.calculateMACD(ohlcv);
    res.send(macd);
}));
app.get('/volumes/:symbol/:timeframe', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let { symbol, timeframe } = req.params;
    symbol = symbol.replace('-', '/');
    const ohlcv = yield bot.fetchOHLCV(symbol, timeframe);
    const volumes = bot.calculateVolumes(ohlcv);
    res.send(volumes);
}));
app.get('/api/support/:symbol/:timeframe', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let { symbol, timeframe } = req.params;
    symbol = symbol.replace('-', '/');
    const ohlcvs = yield bot.fetchOHLCV(symbol, timeframe);
    const support = yield bot.findLowestSupport(ohlcvs);
    res.json({ support });
}));
app.get('/api/resistance/:symbol/:timeframe', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let { symbol, timeframe } = req.params;
    symbol = symbol.replace('-', '/');
    const ohlcvs = yield bot.fetchOHLCV(symbol, timeframe);
    const resistance = yield bot.findTopResistance(ohlcvs);
    res.json({ resistance });
}));
app.listen(3000, () => {
    console.log('Server is running on http://localhost:3000');
});
