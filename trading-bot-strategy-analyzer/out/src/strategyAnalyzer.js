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
Object.defineProperty(exports, "__esModule", { value: true });
exports.analyzeData = exports.fetchRSIAndCheckThreshold = exports.checkRSIThresholds = exports.fetchRSI = void 0;
const fetch = require('node-fetch');
const email_1 = require("./email");
const consts_1 = require("./consts");
const positionManagerAPI = 'http://localhost:3003'; // adjust to your setup
const RSIUpperThreshold = 51;
const RSILowerThreshold = 50;
const positionUSDTAmount = 10;
const RSI_THRESHOLD = 30; // You can adjust this value as per your requirements
const notificationsSent = {};
const fetchRSI = (timeframes = ["1d", "1h", "5m"]) => __awaiter(void 0, void 0, void 0, function* () {
    const symbolsUrl = `${consts_1.SERVER_DATA_URL}/api/symbols/leverage`;
    const rsiBulkUrl = `${consts_1.SERVER_DATA_URL}/api/rsi/bulk`;
    const symbolsResponse = yield fetch(symbolsUrl, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        },
    });
    const symbolsObjects = yield symbolsResponse.json();
    // console.log("🚀 ~ file: strategyAnalyzer.ts:27 ~ fetchRSIAndCheckThreshold ~ symbolsObjects:", symbolsObjects)
    const symbols = symbolsObjects.map(pair => pair.name);
    const rsiResponse = yield fetch(rsiBulkUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ symbols, timeframes })
    });
    const rsiValues = yield rsiResponse.json();
    // console.log("🚀 ~ file: strategyAnalyzer.ts:27 ~ fetchRSIAndCheckThreshold ~ rsiResponse:", rsiValues)
    return { rsiValues, symbols, timeframes };
});
exports.fetchRSI = fetchRSI;
const checkRSIThresholds = (rsiValues, symbols, timeframes) => __awaiter(void 0, void 0, void 0, function* () {
    let signalTriggered = false;
    for (let symbol of symbols) {
        for (let timeframe of timeframes) {
            const rsiValue = rsiValues[symbol] && rsiValues[symbol][timeframe];
            // Initialize if not already present
            if (!notificationsSent[symbol]) {
                notificationsSent[symbol] = {};
            }
            // Check if the RSI is below the threshold and no notification has been sent yet
            if (rsiValue && rsiValue < RSI_THRESHOLD && !notificationsSent[symbol][timeframe]) {
                signalTriggered = true;
                console.log(`RSI value for ${symbol} at ${timeframe} is below the threshold! RSI: ${rsiValue}`);
                // Send signal email
                yield (0, email_1.sendSignalEmail)("RSI Alert", symbol, timeframe, `RSI: ${rsiValue}`, true);
                // Mark notification as sent
                notificationsSent[symbol][timeframe] = true;
            }
            // If the RSI is above the threshold and a notification was previously sent, reset the notification flag
            if (rsiValue && rsiValue >= RSI_THRESHOLD && notificationsSent[symbol][timeframe]) {
                notificationsSent[symbol][timeframe] = false;
            }
        }
    }
    if (!signalTriggered) {
        console.log('No RSI values were below the threshold.');
    }
    return notificationsSent;
});
exports.checkRSIThresholds = checkRSIThresholds;
const fetchRSIAndCheckThreshold = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { rsiValues, symbols, timeframes } = yield (0, exports.fetchRSI)();
        yield (0, exports.checkRSIThresholds)(rsiValues, symbols, timeframes);
    }
    catch (error) {
        console.error('Error fetching RSI data or sending email:', error);
    }
});
exports.fetchRSIAndCheckThreshold = fetchRSIAndCheckThreshold;
const generateBuySignal = (data) => {
    const { ohlcvData, bbData, rsi, macd } = data;
    // Identify if the last candlestick's price touched the lower Bollinger Band
    const lastCandle = ohlcvData[ohlcvData.length - 1];
    const lastBB = bbData[bbData.length - 1];
    const isPriceTouchedLowerBand = lastCandle.low <= lastBB.lower;
    // Check if RSI is below 30
    const lastRSI = rsi[rsi.length - 1];
    const isRSIOverSold = lastRSI.value < RSILowerThreshold;
    // Check if MACD crossed above the signal line
    const lastMACD = macd[macd.length - 1];
    const previousMACD = macd[macd.length - 2];
    const isMACDBullish = previousMACD.macd <= previousMACD.signal && lastMACD.macd > lastMACD.signal;
    return isPriceTouchedLowerBand && isRSIOverSold && isMACDBullish;
};
const generateSellSignal = (data) => {
    const { ohlcvData, bbData, rsi, macd } = data;
    // Identify if the last candlestick's price touched the upper Bollinger Band
    const lastCandle = ohlcvData[ohlcvData.length - 1];
    const lastBB = bbData[bbData.length - 1];
    const isPriceTouchedUpperBand = lastCandle.high >= lastBB.upper;
    // Check if RSI is above 70
    const lastRSI = rsi[rsi.length - 1];
    const isRSIOverBought = lastRSI.value > RSIUpperThreshold;
    // Check if MACD crossed below the signal line
    const lastMACD = macd[macd.length - 1];
    const previousMACD = macd[macd.length - 2];
    const isMACDBearish = previousMACD.macd >= previousMACD.signal && lastMACD.macd < lastMACD.signal;
    return isPriceTouchedUpperBand && isRSIOverBought && isMACDBearish;
};
function analyzeRSI(data) {
    // // console.log("🚀 ~ file: strategyAnalyzer.ts:41 ~ analyzeRSI ~ data:", data)
    const { rsi } = data;
    const { ohlcvData } = data;
    const length = rsi.length;
    const latestRSI = rsi[length - 1];
    const signals = {
        buySignal: {},
        sellSignal: {}
    };
    if (latestRSI < RSILowerThreshold) {
        signals.buySignal = {
            price: ohlcvData[length - 1][5],
            time: ohlcvData[length - 1][0],
            indicatorValue: latestRSI,
            signal: 'Buy',
        };
    }
    else if (latestRSI > RSIUpperThreshold) {
        signals.sellSignal = {
            price: ohlcvData[length - 1][5],
            time: ohlcvData[length - 1][0],
            indicatorValue: latestRSI,
            signal: 'Sell',
        };
    }
    return signals;
}
function fetchData(symbol, timeframe) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const responses = yield Promise.all([
                fetch(`http://localhost:3000/api/data/${symbol}/${timeframe}`),
                fetch(`http://localhost:3000/bollinger-bands/${symbol}/${timeframe}`),
                fetch(`http://localhost:3000/rsi/${symbol}/${timeframe}`),
                fetch(`http://localhost:3000/macd/${symbol}/${timeframe}`),
            ]);
            const data = yield Promise.all(responses.map(response => response.json()));
            const [ohlcvData, bbData, rsi, macd] = data;
            return {
                ohlcvData,
                bbData,
                rsi,
                macd
            };
        }
        catch (error) {
            console.error(`Failed to fetch data for ${symbol} on ${timeframe}:`, error);
        }
    });
}
function completeAnalysis(symbol, timeframe) {
    return __awaiter(this, void 0, void 0, function* () {
        const data = yield fetchData(symbol, timeframe);
        const buySignal = generateBuySignal(data);
        const sellSignal = generateSellSignal(data);
        return [data, { buySignal, sellSignal }];
    });
}
function openLongPosition(symbol, price) {
    return __awaiter(this, void 0, void 0, function* () {
        const position = JSON.stringify({
            symbol: symbol,
            buyPrice: price,
            quantity: positionUSDTAmount,
            type: 'long' // this is a long position
        });
        try {
            const res = yield fetch(`${positionManagerAPI}/position`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: position
            });
            const data = yield res.json();
            // console.log(`Opened new long position with ID ${data.id}`);
        }
        catch (err) {
            console.error(`Failed to open long position: ${position} ${err}`);
        }
    });
}
function openShortPosition(symbol, price) {
    return __awaiter(this, void 0, void 0, function* () {
        const position = JSON.stringify({
            symbol: symbol,
            sellPrice: price,
            quantity: positionUSDTAmount,
            type: 'short' // this is a short position
        });
        try {
            const res = yield fetch(`${positionManagerAPI}/position`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: position
            });
            const data = yield res.json();
            // console.log("🚀 ~ file: strategyAnalyzer.ts:146 ~ openShortPosition ~ data:", data)
            // console.log(`Opened new short position with ID ${data.id}`);
        }
        catch (err) {
            console.error(`Failed to open short position: ${position} ${err}`);
        }
    });
}
function analyzeData(symbol, timeframe, analysisType, signalStatus, autoOpenPosition = true) {
    var _a, _b, _c, _d;
    return __awaiter(this, void 0, void 0, function* () {
        // Fetch data
        const data = yield fetchData(symbol, timeframe);
        let analysisResult;
        let key = `${analysisType}_${symbol}_${timeframe}`;
        switch (analysisType) {
            case 'RSI':
                analysisResult = analyzeRSI(data);
                if (analysisResult.buySignal && !((_a = signalStatus[key]) === null || _a === void 0 ? void 0 : _a.buySignal)) {
                    yield (0, email_1.sendSignalEmail)("long", symbol, timeframe, 'RSI');
                    if (!signalStatus[key])
                        signalStatus[key] = {};
                    signalStatus[key].buySignal = true;
                    // Open a new long position
                    if (autoOpenPosition)
                        openLongPosition(symbol, data === null || data === void 0 ? void 0 : data.ohlcvData[(data === null || data === void 0 ? void 0 : data.ohlcvData.length) - 1][4]);
                }
                else if (analysisResult.sellSignal && !((_b = signalStatus[key]) === null || _b === void 0 ? void 0 : _b.sellSignal)) {
                    yield (0, email_1.sendSignalEmail)("short", symbol, timeframe, 'RSI');
                    if (!signalStatus[key])
                        signalStatus[key] = {};
                    signalStatus[key].sellSignal = true;
                    // Open a new short position
                    if (autoOpenPosition)
                        openShortPosition(symbol, data === null || data === void 0 ? void 0 : data.ohlcvData[(data === null || data === void 0 ? void 0 : data.ohlcvData.length) - 1][4]);
                }
                else {
                    if (!signalStatus[key])
                        signalStatus[key] = {};
                    signalStatus[key].buySignal = analysisResult.buySignal;
                    signalStatus[key].sellSignal = analysisResult.sellSignal;
                }
                break;
            // Add cases for other analysis types here...
            case "COMPLETE_ANALYSIS":
                analysisResult = yield completeAnalysis(symbol, timeframe);
                if (analysisResult.buySignal && !((_c = signalStatus[key]) === null || _c === void 0 ? void 0 : _c.buySignal)) {
                    yield (0, email_1.sendSignalEmail)("buy", symbol, timeframe, 'Complete');
                    if (!signalStatus[key])
                        signalStatus[key] = {};
                    signalStatus[key].buySignal = true;
                    if (autoOpenPosition)
                        openLongPosition(symbol, data === null || data === void 0 ? void 0 : data.ohlcvData[(data === null || data === void 0 ? void 0 : data.ohlcvData.length) - 1][4]);
                }
                else if (analysisResult.sellSignal && !((_d = signalStatus[key]) === null || _d === void 0 ? void 0 : _d.sellSignal)) {
                    yield (0, email_1.sendSignalEmail)("sell", symbol, timeframe, 'Complete');
                    if (!signalStatus[key])
                        signalStatus[key] = {};
                    signalStatus[key].sellSignal = true;
                    if (autoOpenPosition)
                        openShortPosition(symbol, data === null || data === void 0 ? void 0 : data.ohlcvData[(data === null || data === void 0 ? void 0 : data.ohlcvData.length) - 1][4]);
                }
                else {
                    if (!signalStatus[key])
                        signalStatus[key] = {};
                    signalStatus[key].buySignal = analysisResult.buySignal;
                    signalStatus[key].sellSignal = analysisResult.sellSignal;
                }
                break;
            default:
                // console.log(`Unknown analysis type: ${analysisType}`);
                return;
        }
        return [data, analysisResult];
    });
}
exports.analyzeData = analyzeData;
//# sourceMappingURL=strategyAnalyzer.js.map