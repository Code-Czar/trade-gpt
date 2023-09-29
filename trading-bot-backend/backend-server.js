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
const bodyParser = require('body-parser');
const dataConvertor = require('./src/utils/convertData');
const { PAIR_TYPES, TradingBot } = require('./src/bot');
const bot = new TradingBot('binance');
const symbol = 'BTC/USDT';
const timeframe = '1m'; // 1 day
const app = express();
app.use(bodyParser.json());
// Enable CORS
app.use(cors());
// Data store
let ohlcvData = null;
// Fetch new data every 1 minute
let count = 0;
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
// Setup POST route
app.post('/rsi', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { ohlcv } = req.body;
    // Ensure symbol and timeframe are provided
    if (!ohlcv) {
        return res.status(400).send({ error: 'OHLCV are required.' });
    }
    const rsi = bot.calculateRSI(ohlcv);
    res.send({ rsi });
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
app.get('/api/historical/:symbol/:timeframe/:limit', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { symbol, timeframe, limit } = req.params;
    try {
        // Determine the type of the pair (this might require a helper function or logic)
        // For demonstration purposes, I'm assuming the symbol belongs to 'leveragePairs'.
        // But in a real-world scenario, you might want to determine the exact pair type 
        // dynamically or by some other means.
        const pairType = PAIR_TYPES.leveragePairs; // or forexPairs, cryptoPairs, etc.
        // Access the bot's dataStore to get the stored data
        const symbolData = bot.dataStore.get(pairType).get(symbol);
        if (!symbolData || !symbolData.ohlcvs.has(timeframe)) {
            res.status(404).json({ error: 'Data not found' });
            return;
        }
        const ohlcvs = symbolData.ohlcvs.get(timeframe);
        // Return only the latest data up to the limit
        const latestData = ohlcvs.slice(-parseInt(limit));
        res.json(latestData);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error fetching historical data' });
    }
}));
app.get('/api/resistance/:symbol/:timeframe', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let { symbol, timeframe } = req.params;
    symbol = symbol.replace('-', '/');
    const ohlcvs = yield bot.fetchOHLCV(symbol, timeframe);
    const resistance = yield bot.findTopResistance(ohlcvs);
    res.json({ resistance });
}));
app.get('/api/symbols/leverage', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const symbolsWithLeverage = yield bot.getBybitPairsWithLeverage();
        res.json(symbolsWithLeverage);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error fetching symbols with leverage' });
    }
}));
app.post('/api/rsi/bulk', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { symbols, timeframes } = req.body;
    if (!symbols || !timeframes) {
        return res.status(400).send({ error: 'Symbols and timeframes are required.' });
    }
    const rsiValues = {};
    for (let symbol of symbols) {
        rsiValues[symbol] = {};
        for (let timeframe of timeframes) {
            try {
                const symbolData = bot.dataStore.get(PAIR_TYPES.leveragePairs).get(symbol); // Change PAIR_TYPES.cryptoPairs based on your needs
                if (symbolData && symbolData.rsi && symbolData.rsi.has(timeframe)) {
                    rsiValues[symbol][timeframe] = symbolData.rsi.get(timeframe);
                }
                else {
                    rsiValues[symbol][timeframe] = null;
                }
            }
            catch (error) {
                console.error(`Error fetching RSI from datastore for ${symbol} and ${timeframe}:`, error);
            }
        }
    }
    res.json(rsiValues);
}));
// Tests 
app.get('/api/rsi/getValues', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("🚀 ~ file: backend-server.ts:170 ~ app.get ~ bot.dataStore:", bot.dataStore, dataConvertor);
    return res.json(dataConvertor.stringifyMap(bot.dataStore));
}));
app.listen(3000, () => {
    // console.log('Server is running on http://localhost:3000');
    bot.populateDataStore();
});
