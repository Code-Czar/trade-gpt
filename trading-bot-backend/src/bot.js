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
exports.TradingBot = void 0;
const ccxt = __importStar(require("ccxt"));
const technicalindicators_1 = require("technicalindicators");
const fs = require('fs');
const path = require('path');
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
class TradingBot {
    constructor(exchangeId) {
        this.allSymbols = [];
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
    calculateBollingerBands(ohlcv) {
        const closeValues = ohlcv.map(x => x[4]);
        return technicalindicators_1.BollingerBands.calculate({ period: 20, values: closeValues, stdDev: 2 });
    }
    calculateRSI(ohlcv) {
        const closeValues = ohlcv.map(x => x[4]);
        return technicalindicators_1.RSI.calculate({ values: closeValues, period: 14 });
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
