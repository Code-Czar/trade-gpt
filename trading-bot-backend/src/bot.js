"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
exports.TradingBot = exports.PAIR_TYPES = void 0;
const ccxt = __importStar(require("ccxt"));
const technicalindicators_1 = require("technicalindicators");
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const MAJOR_CURRENCIES = ["USD", "EUR", "GBP", "JPY", "AUD", "CAD", "CHF", "NZD"];
const FOREX_API_KEY = 'IUQ1W2DHSATKLZY9';
const forexPairs = [
    "EUR-USD", "USD-JPY", "GBP-USD", "USD-CHF", "USD-CAD", "AUD-USD", "NZD-USD",
    "EUR-GBP", "EUR-AUD", "GBP-JPY", "CHF-JPY", "EUR-CAD", "AUD-CAD", "CAD-JPY", "NZD-JPY",
    "GBP-CAD", "GBP-NZD", "GBP-AUD", "EUR-NZD", "AUD-NZD", "AUD-JPY", "USD-SGD", "USD-HKD",
    "USD-TRY", "EUR-TRY", "USD-INR", "USD-MXN", "USD-ZAR", "USD-THB"
];
const timeframes = ['1m', '5m', '1h', '4h', '1d', '1w'];
const FOREX_API_KEYS = [
    '289YKE5QXT6WYTMU',
    'BEB6S2C4NGEOXRCA',
    'SCZH4OGNM52B2X5P',
    'ZP3O6MM02ZZUHJG2',
    'ES2AURLO7XEFUHGC',
    'MUGYSNS1C5QEDUZX',
];
let currentKeyIndex = 0;
exports.PAIR_TYPES = {
    leveragePairs: 'leveragePairs',
    forexPairs: 'forexPairs',
    cryptoPairs: 'cryptoPairs'
};
// Continuously populate the data store for all pairs
class TradingBot {
    constructor(exchangeId) {
        this.allSymbols = [];
        this.dataStore = new Map();
        this.dataStore.set(exports.PAIR_TYPES.leveragePairs, new Map());
        this.dataStore.set(exports.PAIR_TYPES.forexPairs, new Map());
        this.dataStore.set(exports.PAIR_TYPES.cryptoPairs, new Map());
        this.exchange = new ccxt[exchangeId]();
        // this.fetchAllForexPairs()
        const filePath = path.resolve(__dirname, 'existingPairs.txt');
        if (!fs.existsSync(filePath) || !fs.readFileSync(filePath, 'utf8').trim().split('\n').length) {
            this.checkFOREXPairsExistence().then((existingPairs) => {
                fs.writeFileSync(filePath, existingPairs.join('\n'));
                console.log('Existing pairs have been saved!');
            }).catch((error) => {
                console.error("Error checking pairs:", error);
            });
        }
    }
    fetchOHLCV(symbol, timeframe) {
        return __awaiter(this, void 0, void 0, function* () {
            const formattedSymbol = symbol.replace('/', '-');
            const isForex = forexPairs.includes(formattedSymbol);
            console.log("🚀 ~ file: bot.ts:44 ~ TradingBot ~ fetchOHLCV ~ formattedSymbol:", formattedSymbol, isForex);
            if (isForex) {
                return yield this.fetchFOREXOHLC(formattedSymbol.replace('-', ''), timeframe);
            }
            else {
                return yield this.fetchCryptoOHLCV(symbol, timeframe);
            }
        });
    }
    fetchCryptoOHLCV(symbol, timeframe) {
        return __awaiter(this, void 0, void 0, function* () {
            while (true) {
                try {
                    yield this.exchange.loadMarkets();
                    return this.exchange.fetchOHLCV(symbol, timeframe);
                }
                catch (error) {
                    if (error instanceof ccxt.DDoSProtection) {
                        // console.log('Rate limit hit, waiting before retrying...');
                        yield new Promise(resolve => setTimeout(resolve, 1000)); // wait for 1 second
                    }
                    else {
                        throw error; // re-throw the error if it's not a rate limit error
                    }
                }
            }
        });
    }
    fetchFOREXOHLC(symbol, timeframe) {
        return __awaiter(this, void 0, void 0, function* () {
            const BASE_URL = `https://www.alphavantage.co/query?function=TIME_SERIES_INTRADAY&symbol=${symbol}&interval=${timeframe}&apikey=${FOREX_API_KEY}`;
            // const response = await fetch(BASE_URL);
            const data = yield this.fetchWithRotatingApiKey(BASE_URL);
            // const data = await response.json();
            console.log("🚀 ~ file: bot.ts:75 ~ TradingBot ~ fetchFOREXOHLC ~ data:", data);
            let formattedOHLCData = [];
            // Filter for the key that starts with 'Time Series'
            const timeSeriesKey = Object.keys(data).find(key => key.startsWith('Time Series'));
            if (!timeSeriesKey) {
                console.error('Failed to find the Time Series key in the response.');
                return null;
            }
            const timeSeries = data[timeSeriesKey];
            for (let date in timeSeries) {
                const ohlc = timeSeries[date];
                const timestamp = new Date(date).getTime();
                formattedOHLCData.push([
                    timestamp,
                    parseFloat(ohlc['1. open']),
                    parseFloat(ohlc['2. high']),
                    parseFloat(ohlc['3. low']),
                    parseFloat(ohlc['4. close']),
                    parseFloat(ohlc['5. volume'] || "0") // Assuming default volume of 0 if not provided
                ]);
            }
            fs.writeFileSync("forexdata.json", JSON.stringify(formattedOHLCData));
            return formattedOHLCData;
        });
    }
    fetchWithRotatingApiKey(url) {
        return __awaiter(this, void 0, void 0, function* () {
            let response;
            let attempts = 0;
            while (attempts < FOREX_API_KEYS.length) {
                try {
                    const apiKey = FOREX_API_KEYS[currentKeyIndex];
                    response = yield fetch(`${url}&apikey=${apiKey}`);
                    // If you're using a library like Axios, you might get a status code
                    // directly. With fetch, you'll have to check response.ok or response.status.
                    if (response.ok) {
                        return yield response.json();
                    }
                    else if (response.status === 429) { // 429 is the typical "Too Many Requests" HTTP status code
                        // Rotate to the next key for the next attempt
                        currentKeyIndex = (currentKeyIndex + 1) % FOREX_API_KEYS.length;
                        attempts++;
                    }
                    else {
                        throw new Error(`Request failed with status ${response.status}`);
                    }
                }
                catch (error) {
                    console.error("Failed to fetch with current API key. Trying the next one.", error);
                    currentKeyIndex = (currentKeyIndex + 1) % FOREX_API_KEYS.length;
                    attempts++;
                }
            }
            throw new Error("All API keys have reached their rate limits.");
        });
    }
    checkFOREXPairsExistence() {
        return __awaiter(this, void 0, void 0, function* () {
            const existingPairs = [];
            for (const pair of forexPairs) {
                const response = yield fetch(`https://www.alphavantage.co/query?function=TIME_SERIES_DAILY_ADJUSTED&symbol=${pair}&apikey=${FOREX_API_KEY}`);
                const data = yield response.json();
                if (!data['Error Message'] && !data['Note']) {
                    existingPairs.push(pair);
                }
            }
            return existingPairs;
        });
    }
    fetchSymbolsForCurrency(currency) {
        return __awaiter(this, void 0, void 0, function* () {
            const BASE_URL = `https://www.alphavantage.co/query?function=SYMBOL_SEARCH&keywords=${currency}&apikey=${FOREX_API_KEY}`;
            const response = yield fetch(BASE_URL);
            const data = yield response.json();
            const symbols = [];
            if (data && data.bestMatches) {
                data.bestMatches.forEach(match => {
                    symbols.push(match['1. symbol']);
                });
            }
            else {
                console.error(`Failed to fetch symbols for ${currency}`);
            }
            return symbols;
        });
    }
    populateDataStoreForPair(pairType, symbol, timeframe) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let ohlcvs = null;
                if (pairType === exports.PAIR_TYPES.leveragePairs) {
                    symbol = symbol.name;
                    ohlcvs = yield this.getBinanceHistoricalData(symbol, timeframe);
                }
                else {
                    ohlcvs = yield this.fetchOHLCV(symbol, timeframe);
                }
                if (!ohlcvs) {
                    return;
                }
                const rsi = this.calculateRSI(ohlcvs);
                let symbolData = this.dataStore.get(pairType).get(symbol);
                if (!symbolData) {
                    this.dataStore.get(pairType).set(symbol, {
                        ohlcvs: new Map(),
                        rsi: new Map(),
                    });
                    symbolData = this.dataStore.get(pairType).get(symbol);
                }
                if (symbolData.ohlcvs.has(timeframe)) {
                    const existingOhlcvs = symbolData.ohlcvs.get(timeframe);
                    const combinedOhlcvs = existingOhlcvs.concat(ohlcvs);
                    symbolData.ohlcvs.set(timeframe, combinedOhlcvs.slice(-200)); // Only store the last 200 values
                }
                else {
                    symbolData.ohlcvs.set(timeframe, [ohlcvs]);
                }
                if (symbolData.rsi.has(timeframe)) {
                    const existingRsi = symbolData.rsi.get(timeframe);
                    const combinedRsi = existingRsi.concat(rsi);
                    symbolData.rsi.set(timeframe, combinedRsi.slice(-200)); // Only store the last 200 values
                }
                else {
                    symbolData.rsi.set(timeframe, [rsi]);
                }
                this.dataStore.get(pairType).set(symbol, symbolData);
            }
            catch (error) {
                console.error(`Error populating data store for ${symbol} and ${timeframe}:`, error);
            }
        });
    }
    ;
    populateDataStore(timeframes = ['1d', '1h', '5m']) {
        return __awaiter(this, void 0, void 0, function* () {
            const leveragePairs = yield this.getBybitPairsWithLeverage();
            // Placeholder for forex and crypto pairs
            const forexPairs = [];
            const cryptoPairs = [];
            // Loop indefinitely to keep fetching data for all pairs
            while (true) {
                for (const pair of leveragePairs) {
                    for (const timeframe of timeframes) {
                        yield this.populateDataStoreForPair(exports.PAIR_TYPES.leveragePairs, pair, timeframe);
                    }
                    for (const pair of forexPairs) {
                        yield this.populateDataStoreForPair(exports.PAIR_TYPES.forexPairs, pair, timeframe);
                    }
                    for (const pair of cryptoPairs) {
                        yield this.populateDataStoreForPair(exports.PAIR_TYPES.cryptoPairs, pair, timeframe);
                    }
                }
            }
        });
    }
    ;
    getBybitPairsWithLeverage() {
        return __awaiter(this, void 0, void 0, function* () {
            const url = "https://api.bybit.com/v2/public/symbols";
            const response = yield axios.get(url);
            const data = response.data;
            const pairs_with_leverage = [];
            if (data && data.result) {
                for (const item of data.result) {
                    if (item.leverage_filter && item.leverage_filter.max_leverage) {
                        pairs_with_leverage.push(item);
                    }
                }
            }
            return pairs_with_leverage;
        });
    }
    getBinanceHistoricalData(pair, interval, limit = 200) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const url = `https://api.binance.com/api/v3/klines?symbol=${pair}&interval=${interval}&limit=${limit}`;
                const response = yield axios.get(url);
                const data = response.data;
                const closing_prices = data.map(item => parseFloat(item[4]));
                return closing_prices;
            }
            catch (error) {
            }
        });
    }
    calculateRSI(prices, period = 14) {
        if (prices.length < period + 1) {
            throw new Error("Not enough data to compute RSI");
        }
        const deltas = prices.slice(1).map((price, i) => price - prices[i]);
        const gains = deltas.map(delta => Math.max(delta, 0));
        const losses = deltas.map(delta => Math.abs(Math.min(delta, 0))); // use abs to get positive loss values
        let avg_gain = gains.slice(0, period).reduce((a, b) => a + b) / period;
        let avg_loss = losses.slice(0, period).reduce((a, b) => a + b) / period;
        for (let idx = period; idx < prices.length - 1; idx++) {
            avg_gain = ((avg_gain * (period - 1)) + gains[idx]) / period;
            avg_loss = ((avg_loss * (period - 1)) + losses[idx]) / period;
        }
        if (avg_loss === 0) {
            return 100;
        }
        const rs = avg_gain / avg_loss;
        return 100 - (100 / (1 + rs));
    }
    calculate_rsi_series(prices, period = 14) {
        if (prices.length < period + 1)
            throw new Error("Not enough data to compute RSI series");
        const deltas = prices.slice(1).map((price, i) => price - prices[i]);
        const gains = deltas.map(delta => Math.max(delta, 0));
        const losses = deltas.map(delta => Math.max(-delta, 0));
        let avg_gain = gains.slice(0, period).reduce((a, b) => a + b) / period;
        let avg_loss = losses.slice(0, period).reduce((a, b) => a + b) / period;
        const rsis = [];
        for (let idx = period; idx < prices.length - 1; idx++) {
            avg_gain = ((avg_gain * (period - 1)) + gains[idx]) / period;
            avg_loss = ((avg_loss * (period - 1)) + losses[idx]) / period;
            if (avg_loss === 0) {
                rsis.push(100);
            }
            else {
                const rs = avg_gain / avg_loss;
                rsis.push(100 - (100 / (1 + rs)));
            }
        }
        return rsis;
    }
    calculateBollingerBands(ohlcv) {
        const closeValues = ohlcv.map(x => x[4]);
        return technicalindicators_1.BollingerBands.calculate({ period: 20, values: closeValues, stdDev: 2 });
    }
    calculateMACD(ohlcv) {
        const closeValues = ohlcv.map(x => x[4]);
        return technicalindicators_1.MACD.calculate({
            values: closeValues,
            fastPeriod: 12,
            slowPeriod: 26,
            signalPeriod: 9,
            SimpleMAOscillator: false,
            SimpleMASignal: false
        });
    }
    calculateVolumes(ohlcv) {
        return ohlcv.map(x => x[5]);
    }
    findLowestSupport(ohlcvs) {
        return __awaiter(this, void 0, void 0, function* () {
            let lowest = ohlcvs[0][3];
            for (let i = 1; i < ohlcvs.length; i++) {
                if (ohlcvs[i][3] < lowest) {
                    lowest = ohlcvs[i][3];
                }
            }
            return [0, 0, 0, lowest];
        });
    }
    findSupport(ohlcvs, tolerance = 0.0001) {
        return __awaiter(this, void 0, void 0, function* () {
            const supports = [];
            let potentialSupport = null;
            ohlcvs.forEach((ohlc, index) => {
                if (index === 0)
                    return;
                const prevOhlc = ohlcvs[index - 1];
                // If we're not currently tracking a support level
                if (!potentialSupport) {
                    // And the current price is lower than the previous one, start tracking a potential support level
                    if (ohlc.low < prevOhlc.low) {
                        potentialSupport = {
                            level: ohlc.low,
                            hits: [],
                            start: prevOhlc.time,
                            end: null
                        };
                    }
                }
                else {
                    // If the current price is lower than the potential support level, update it
                    if (ohlc.low < potentialSupport.level) {
                        potentialSupport.level = ohlc.low;
                        potentialSupport.end = ohlc.time;
                    }
                    else {
                        // If the price is within the tolerance of the potential support level, register a hit
                        if (ohlc.low <= potentialSupport.level * (1 + tolerance)) {
                            potentialSupport.hits.push(ohlc);
                        }
                        else if (ohlc.low > potentialSupport.level * (1 + tolerance)) {
                            // If the price rises above the tolerance of the potential support level, finish tracking it
                            if (potentialSupport.hits.length > 1) {
                                supports.push(potentialSupport);
                            }
                            potentialSupport = null;
                        }
                    }
                }
            });
            return supports;
        });
    }
    findTopResistance(ohlcvs) {
        return __awaiter(this, void 0, void 0, function* () {
            let highest = ohlcvs[0][2];
            for (let i = 1; i < ohlcvs.length; i++) {
                if (ohlcvs[i][2] > highest) {
                    highest = ohlcvs[i][2];
                }
            }
            return [0, 0, 0, highest];
        });
    }
    findResistance(ohlcvs, tolerance = 0.0001) {
        return __awaiter(this, void 0, void 0, function* () {
            const resistances = [];
            let potentialResistance = null;
            ohlcvs.forEach((ohlc, index) => {
                if (index === 0)
                    return;
                const prevOhlc = ohlcvs[index - 1];
                // If we're not currently tracking a resistance level
                if (!potentialResistance) {
                    // And the current price is higher than the previous one, start tracking a potential resistance level
                    if (ohlc.high > prevOhlc.high) {
                        potentialResistance = {
                            level: ohlc.high,
                            hits: [],
                            start: prevOhlc.time,
                            end: null
                        };
                    }
                }
                else {
                    // If the current price is higher than the potential resistance level, update it
                    if (ohlc.high > potentialResistance.level) {
                        potentialResistance.level = ohlc.high;
                        potentialResistance.end = ohlc.time;
                    }
                    else {
                        // If the price is within the tolerance of the potential resistance level, register a hit
                        if (ohlc.high >= potentialResistance.level * (1 - tolerance)) {
                            potentialResistance.hits.push(ohlc);
                        }
                        else if (ohlc.high < potentialResistance.level * (1 - tolerance)) {
                            // If the price drops below the tolerance of the potential resistance level, finish tracking it
                            if (potentialResistance.hits.length > 1) {
                                resistances.push(potentialResistance);
                            }
                            potentialResistance = null;
                        }
                    }
                }
            });
            return resistances;
        });
    }
}
exports.TradingBot = TradingBot;
