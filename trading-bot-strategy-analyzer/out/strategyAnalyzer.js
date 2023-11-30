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
exports.analyzeData = exports.fetchRSIAndCheckThreshold = exports.checkRSIThresholds = exports.fetchRSI = void 0;
var fetch = require('node-fetch');
var email_1 = require("./notifiers/email");
var notificationsSender_1 = require("./notifiers/notificationsSender");
var shared_1 = require("shared");
var positionManagerAPI = 'http://localhost:3003'; // adjust to your setup
var RSIUpperThreshold = 51;
var RSILowerThreshold = 50;
var positionUSDTAmount = 10;
var RSI_THRESHOLD = 35; // You can adjust this value as per your requirements
var notificationsSent = {};
var fetchRSI = function (timeframes) {
    if (timeframes === void 0) { timeframes = ["1d", "1h", "5m"]; }
    return __awaiter(void 0, void 0, void 0, function () {
        var symbolsUrl, rsiBulkUrl, symbolsResponse, symbolsObjects, symbols, rsiResponse, rsiValues;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    symbolsUrl = shared_1.BACKEND_URLS.LEVERAGE_URLS.getLeverageSymbols;
                    rsiBulkUrl = shared_1.BACKEND_URLS.RSI_URLS.getAllRSIValues;
                    return [4 /*yield*/, fetch(symbolsUrl, {
                            method: 'GET',
                            headers: {
                                'Content-Type': 'application/json'
                            },
                        })];
                case 1:
                    symbolsResponse = _a.sent();
                    return [4 /*yield*/, symbolsResponse.json()
                        // global.logger.debug("🚀 ~ file: strategyAnalyzer.ts:27 ~ fetchRSIAndCheckThreshold ~ symbolsObjects:", symbolsObjects)
                    ];
                case 2:
                    symbolsObjects = _a.sent();
                    symbols = symbolsObjects.map(function (pair) { return pair.name; });
                    return [4 /*yield*/, fetch(rsiBulkUrl, {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify({ symbols: symbols, timeframes: timeframes })
                        })];
                case 3:
                    rsiResponse = _a.sent();
                    return [4 /*yield*/, rsiResponse.json()];
                case 4:
                    rsiValues = _a.sent();
                    // global.logger.debug("🚀 ~ file: strategyAnalyzer.ts:27 ~ fetchRSIAndCheckThreshold ~ rsiResponse:", rsiValues)
                    return [2 /*return*/, { rsiValues: rsiValues, symbols: symbols, timeframes: timeframes }];
            }
        });
    });
};
exports.fetchRSI = fetchRSI;
var checkRSIThresholds = function (rsiValues, symbols, timeframes) { return __awaiter(void 0, void 0, void 0, function () {
    var signalTriggered, _i, symbols_1, symbol, _a, timeframes_1, timeframe, rsiValue, error_1, error_2;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                signalTriggered = false;
                _i = 0, symbols_1 = symbols;
                _b.label = 1;
            case 1:
                if (!(_i < symbols_1.length)) return [3 /*break*/, 13];
                symbol = symbols_1[_i];
                _a = 0, timeframes_1 = timeframes;
                _b.label = 2;
            case 2:
                if (!(_a < timeframes_1.length)) return [3 /*break*/, 12];
                timeframe = timeframes_1[_a];
                rsiValue = rsiValues[symbol] && rsiValues[symbol][timeframe];
                // Initialize if not already present
                if (!notificationsSent[symbol]) {
                    notificationsSent[symbol] = {};
                }
                if (!(rsiValue && rsiValue < RSI_THRESHOLD && !notificationsSent[symbol][timeframe])) return [3 /*break*/, 10];
                signalTriggered = true;
                global.logger.debug("RSI value for ".concat(symbol, " at ").concat(timeframe, " is below the threshold! RSI: ").concat(rsiValue));
                _b.label = 3;
            case 3:
                _b.trys.push([3, 5, , 6]);
                return [4 /*yield*/, (0, notificationsSender_1.sendNotification)("RSI Alert: ".concat(symbol, " at ").concat(timeframe, " is below the threshold! RSI: ").concat(rsiValue))];
            case 4:
                _b.sent();
                return [3 /*break*/, 6];
            case 5:
                error_1 = _b.sent();
                global.logger.debug("🚀 ~ file: strategyAnalyzer.ts:66 ~ checkRSIThresholds ~ error:", error_1);
                return [3 /*break*/, 6];
            case 6:
                _b.trys.push([6, 8, , 9]);
                return [4 /*yield*/, (0, email_1.sendSignalEmail)("RSI Alert", symbol, timeframe, "RSI: ".concat(rsiValue), true)];
            case 7:
                _b.sent();
                return [3 /*break*/, 9];
            case 8:
                error_2 = _b.sent();
                global.logger.debug("🚀 ~ file: strategyAnalyzer.ts:73 ~ checkRSIThresholds ~ error:", error_2);
                return [3 /*break*/, 9];
            case 9:
                // await sendNotification("RSI Alert : ", symbol, timeframe, `RSI: ${rsiValue}`, true);
                // Mark notification as sent
                notificationsSent[symbol][timeframe] = true;
                _b.label = 10;
            case 10:
                // If the RSI is above the threshold and a notification was previously sent, reset the notification flag
                if (rsiValue && rsiValue >= RSI_THRESHOLD && notificationsSent[symbol][timeframe]) {
                    notificationsSent[symbol][timeframe] = false;
                }
                _b.label = 11;
            case 11:
                _a++;
                return [3 /*break*/, 2];
            case 12:
                _i++;
                return [3 /*break*/, 1];
            case 13:
                if (!signalTriggered) {
                    global.logger.debug('No RSI values were below the threshold.');
                }
                return [2 /*return*/, notificationsSent];
        }
    });
}); };
exports.checkRSIThresholds = checkRSIThresholds;
var fetchRSIAndCheckThreshold = function () { return __awaiter(void 0, void 0, void 0, function () {
    var _a, rsiValues, symbols, timeframes, error_3;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 3, , 4]);
                return [4 /*yield*/, (0, exports.fetchRSI)()];
            case 1:
                _a = _b.sent(), rsiValues = _a.rsiValues, symbols = _a.symbols, timeframes = _a.timeframes;
                return [4 /*yield*/, (0, exports.checkRSIThresholds)(rsiValues, symbols, timeframes)];
            case 2:
                _b.sent();
                return [3 /*break*/, 4];
            case 3:
                error_3 = _b.sent();
                console.error('Error fetching RSI data or sending email:', error_3);
                return [3 /*break*/, 4];
            case 4: return [2 /*return*/];
        }
    });
}); };
exports.fetchRSIAndCheckThreshold = fetchRSIAndCheckThreshold;
var generateBuySignal = function (data) {
    var ohlcvData = data.ohlcvData, bbData = data.bbData, rsi = data.rsi, macd = data.macd;
    // Identify if the last candlestick's price touched the lower Bollinger Band
    var lastCandle = ohlcvData[ohlcvData.length - 1];
    var lastBB = bbData[bbData.length - 1];
    var isPriceTouchedLowerBand = lastCandle.low <= lastBB.lower;
    // Check if RSI is below 30
    var lastRSI = rsi[rsi.length - 1];
    var isRSIOverSold = lastRSI.value < RSILowerThreshold;
    // Check if MACD crossed above the signal line
    var lastMACD = macd[macd.length - 1];
    var previousMACD = macd[macd.length - 2];
    var isMACDBullish = previousMACD.macd <= previousMACD.signal && lastMACD.macd > lastMACD.signal;
    return isPriceTouchedLowerBand && isRSIOverSold && isMACDBullish;
};
var generateSellSignal = function (data) {
    var ohlcvData = data.ohlcvData, bbData = data.bbData, rsi = data.rsi, macd = data.macd;
    // Identify if the last candlestick's price touched the upper Bollinger Band
    var lastCandle = ohlcvData[ohlcvData.length - 1];
    var lastBB = bbData[bbData.length - 1];
    var isPriceTouchedUpperBand = lastCandle.high >= lastBB.upper;
    // Check if RSI is above 70
    var lastRSI = rsi[rsi.length - 1];
    var isRSIOverBought = lastRSI.value > RSIUpperThreshold;
    // Check if MACD crossed below the signal line
    var lastMACD = macd[macd.length - 1];
    var previousMACD = macd[macd.length - 2];
    var isMACDBearish = previousMACD.macd >= previousMACD.signal && lastMACD.macd < lastMACD.signal;
    return isPriceTouchedUpperBand && isRSIOverBought && isMACDBearish;
};
function analyzeRSI(data) {
    // // global.logger.debug("🚀 ~ file: strategyAnalyzer.ts:41 ~ analyzeRSI ~ data:", data)
    var rsi = data.rsi;
    var ohlcvData = data.ohlcvData;
    var length = rsi.length;
    var latestRSI = rsi[length - 1];
    var signals = {
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
    return __awaiter(this, void 0, void 0, function () {
        var responses, data, ohlcvData, bbData, rsi, macd, error_4;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 3, , 4]);
                    return [4 /*yield*/, Promise.all([
                            fetch("http://localhost:3000/api/data/".concat(symbol, "/").concat(timeframe)),
                            fetch("http://localhost:3000/bollinger-bands/".concat(symbol, "/").concat(timeframe)),
                            fetch("http://localhost:3000/rsi/".concat(symbol, "/").concat(timeframe)),
                            fetch("http://localhost:3000/macd/".concat(symbol, "/").concat(timeframe)),
                        ])];
                case 1:
                    responses = _a.sent();
                    return [4 /*yield*/, Promise.all(responses.map(function (response) { return response.json(); }))];
                case 2:
                    data = _a.sent();
                    ohlcvData = data[0], bbData = data[1], rsi = data[2], macd = data[3];
                    return [2 /*return*/, {
                            ohlcvData: ohlcvData,
                            bbData: bbData,
                            rsi: rsi,
                            macd: macd
                        }];
                case 3:
                    error_4 = _a.sent();
                    console.error("Failed to fetch data for ".concat(symbol, " on ").concat(timeframe, ":"), error_4);
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    });
}
function completeAnalysis(symbol, timeframe) {
    return __awaiter(this, void 0, void 0, function () {
        var data, buySignal, sellSignal;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, fetchData(symbol, timeframe)];
                case 1:
                    data = _a.sent();
                    buySignal = generateBuySignal(data);
                    sellSignal = generateSellSignal(data);
                    return [2 /*return*/, [data, { buySignal: buySignal, sellSignal: sellSignal }]];
            }
        });
    });
}
function openLongPosition(symbol, price) {
    return __awaiter(this, void 0, void 0, function () {
        var position, res, data, err_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    position = JSON.stringify({
                        symbol: symbol,
                        buyPrice: price,
                        quantity: positionUSDTAmount, // TODO: adjust the quantity based on your strategy
                        type: 'long' // this is a long position
                    });
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 4, , 5]);
                    return [4 /*yield*/, fetch("".concat(positionManagerAPI, "/position"), {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: position
                        })];
                case 2:
                    res = _a.sent();
                    return [4 /*yield*/, res.json()];
                case 3:
                    data = _a.sent();
                    return [3 /*break*/, 5];
                case 4:
                    err_1 = _a.sent();
                    console.error("Failed to open long position: ".concat(position, " ").concat(err_1));
                    return [3 /*break*/, 5];
                case 5: return [2 /*return*/];
            }
        });
    });
}
function openShortPosition(symbol, price) {
    return __awaiter(this, void 0, void 0, function () {
        var position, res, data, err_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    position = JSON.stringify({
                        symbol: symbol,
                        sellPrice: price,
                        quantity: positionUSDTAmount, // TODO: adjust the quantity based on your strategy
                        type: 'short' // this is a short position
                    });
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 4, , 5]);
                    return [4 /*yield*/, fetch("".concat(positionManagerAPI, "/position"), {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: position
                        })];
                case 2:
                    res = _a.sent();
                    return [4 /*yield*/, res.json()];
                case 3:
                    data = _a.sent();
                    return [3 /*break*/, 5];
                case 4:
                    err_2 = _a.sent();
                    console.error("Failed to open short position: ".concat(position, " ").concat(err_2));
                    return [3 /*break*/, 5];
                case 5: return [2 /*return*/];
            }
        });
    });
}
function analyzeData(symbol, timeframe, analysisType, signalStatus, autoOpenPosition) {
    var _a, _b, _c, _d;
    if (autoOpenPosition === void 0) { autoOpenPosition = true; }
    return __awaiter(this, void 0, void 0, function () {
        var data, analysisResult, key, _e;
        return __generator(this, function (_f) {
            switch (_f.label) {
                case 0: return [4 /*yield*/, fetchData(symbol, timeframe)];
                case 1:
                    data = _f.sent();
                    key = "".concat(analysisType, "_").concat(symbol, "_").concat(timeframe);
                    _e = analysisType;
                    switch (_e) {
                        case 'RSI': return [3 /*break*/, 2];
                        case "COMPLETE_ANALYSIS": return [3 /*break*/, 8];
                    }
                    return [3 /*break*/, 15];
                case 2:
                    analysisResult = analyzeRSI(data);
                    if (!(analysisResult.buySignal && !((_a = signalStatus[key]) === null || _a === void 0 ? void 0 : _a.buySignal))) return [3 /*break*/, 4];
                    return [4 /*yield*/, (0, email_1.sendSignalEmail)("long", symbol, timeframe, 'RSI')];
                case 3:
                    _f.sent();
                    if (!signalStatus[key])
                        signalStatus[key] = {};
                    signalStatus[key].buySignal = true;
                    // Open a new long position
                    if (autoOpenPosition)
                        openLongPosition(symbol, data === null || data === void 0 ? void 0 : data.ohlcvData[(data === null || data === void 0 ? void 0 : data.ohlcvData.length) - 1][4]);
                    return [3 /*break*/, 7];
                case 4:
                    if (!(analysisResult.sellSignal && !((_b = signalStatus[key]) === null || _b === void 0 ? void 0 : _b.sellSignal))) return [3 /*break*/, 6];
                    return [4 /*yield*/, (0, email_1.sendSignalEmail)("short", symbol, timeframe, 'RSI')];
                case 5:
                    _f.sent();
                    if (!signalStatus[key])
                        signalStatus[key] = {};
                    signalStatus[key].sellSignal = true;
                    // Open a new short position
                    if (autoOpenPosition)
                        openShortPosition(symbol, data === null || data === void 0 ? void 0 : data.ohlcvData[(data === null || data === void 0 ? void 0 : data.ohlcvData.length) - 1][4]);
                    return [3 /*break*/, 7];
                case 6:
                    if (!signalStatus[key])
                        signalStatus[key] = {};
                    signalStatus[key].buySignal = analysisResult.buySignal;
                    signalStatus[key].sellSignal = analysisResult.sellSignal;
                    _f.label = 7;
                case 7: return [3 /*break*/, 16];
                case 8: return [4 /*yield*/, completeAnalysis(symbol, timeframe)];
                case 9:
                    analysisResult = _f.sent();
                    if (!(analysisResult.buySignal && !((_c = signalStatus[key]) === null || _c === void 0 ? void 0 : _c.buySignal))) return [3 /*break*/, 11];
                    return [4 /*yield*/, (0, email_1.sendSignalEmail)("buy", symbol, timeframe, 'Complete')];
                case 10:
                    _f.sent();
                    if (!signalStatus[key])
                        signalStatus[key] = {};
                    signalStatus[key].buySignal = true;
                    if (autoOpenPosition)
                        openLongPosition(symbol, data === null || data === void 0 ? void 0 : data.ohlcvData[(data === null || data === void 0 ? void 0 : data.ohlcvData.length) - 1][4]);
                    return [3 /*break*/, 14];
                case 11:
                    if (!(analysisResult.sellSignal && !((_d = signalStatus[key]) === null || _d === void 0 ? void 0 : _d.sellSignal))) return [3 /*break*/, 13];
                    return [4 /*yield*/, (0, email_1.sendSignalEmail)("sell", symbol, timeframe, 'Complete')];
                case 12:
                    _f.sent();
                    if (!signalStatus[key])
                        signalStatus[key] = {};
                    signalStatus[key].sellSignal = true;
                    if (autoOpenPosition)
                        openShortPosition(symbol, data === null || data === void 0 ? void 0 : data.ohlcvData[(data === null || data === void 0 ? void 0 : data.ohlcvData.length) - 1][4]);
                    return [3 /*break*/, 14];
                case 13:
                    if (!signalStatus[key])
                        signalStatus[key] = {};
                    signalStatus[key].buySignal = analysisResult.buySignal;
                    signalStatus[key].sellSignal = analysisResult.sellSignal;
                    _f.label = 14;
                case 14: return [3 /*break*/, 16];
                case 15: 
                // global.logger.debug(`Unknown analysis type: ${analysisType}`);
                return [2 /*return*/];
                case 16: return [2 /*return*/, [data, analysisResult]];
            }
        });
    });
}
exports.analyzeData = analyzeData;
