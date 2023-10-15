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
// // import express, { Request, Response } from 'express';
// import cors from 'cors';
// import bodyParser from 'body-parser';
var consts_1 = require("./types/consts");
var convertData_1 = require("./utils/convertData");
var dataFetchers_1 = require("./dataFetchers");
var TradingBot = require('./bot').TradingBot;
var bot = new TradingBot('binance');
var express = require('express');
// const { Request, Response } = require('express');
var cors = require('cors');
// const bodyParser = require('bodyParser');
var bodyParser = require('body-parser');
// const dataConvertor = require('./utils/convertData')
var app = express();
app.use(bodyParser.json());
// Enable CORS
app.use(cors());
// Fetch new data every 1 minute
var count = 0;
app.get('/api/symbols/leverage', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var symbolsWithLeverage, error_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, dataFetchers_1.cryptoFetcher.getBybitPairsWithLeverage()];
            case 1:
                symbolsWithLeverage = _a.sent();
                res.status(200).json(symbolsWithLeverage);
                return [3 /*break*/, 3];
            case 2:
                error_1 = _a.sent();
                console.error(error_1);
                res.status(500).json({ error: 'Error fetching symbols with leverage' });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); });
app.get('/api/leverage/fullData/:symbol', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var symbol, symbolData, error_2;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                symbol = req.params.symbol;
                _a.label = 1;
            case 1:
                _a.trys.push([1, 3, , 4]);
                return [4 /*yield*/, (0, convertData_1.convertPairToJSON)(bot.dataStore.get(consts_1.PAIR_TYPES.leveragePairs).get(symbol))];
            case 2:
                symbolData = _a.sent();
                res.status(200).json(symbolData);
                return [3 /*break*/, 4];
            case 3:
                error_2 = _a.sent();
                console.error(error_2);
                res.status(500).json({ error: '/api/leverage/fullData : Error fetching data' });
                return [3 /*break*/, 4];
            case 4: return [2 /*return*/];
        }
    });
}); });
app.get('/api/leverage/fullData/:symbol/:timeframe', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, symbol, timeframe, symbolData, result_1, error_3;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _a = req.params, symbol = _a.symbol, timeframe = _a.timeframe;
                _b.label = 1;
            case 1:
                _b.trys.push([1, 3, , 4]);
                return [4 /*yield*/, (0, convertData_1.convertPairToJSON)(bot.dataStore.get(consts_1.PAIR_TYPES.leveragePairs).get(symbol))];
            case 2:
                symbolData = _b.sent();
                result_1 = {};
                Object.entries(symbolData).forEach(function (_a) {
                    var key = _a[0], value = _a[1];
                    if (value[timeframe]) {
                        result_1[key] = value[timeframe];
                    }
                });
                res.status(200).json(result_1);
                return [3 /*break*/, 4];
            case 3:
                error_3 = _b.sent();
                console.error(error_3);
                res.status(500).json({ error: '/api/leverage/fullData : Error fetching data' });
                return [3 /*break*/, 4];
            case 4: return [2 /*return*/];
        }
    });
}); });
// Retrieves OHLCV, RSI, SMA, EMA, MACD, VOLUMES, Bollinger Bands
app.get('/api/leverage/:symbol/:subdata', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, symbol, subdata, symbolData, error_4;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _a = req.params, symbol = _a.symbol, subdata = _a.subdata;
                _b.label = 1;
            case 1:
                _b.trys.push([1, 3, , 4]);
                return [4 /*yield*/, (0, convertData_1.convertPairToJSON)(bot.dataStore.get(consts_1.PAIR_TYPES.leveragePairs).get(symbol))];
            case 2:
                symbolData = _b.sent();
                res.status(200).json(symbolData[subdata]);
                return [3 /*break*/, 4];
            case 3:
                error_4 = _b.sent();
                console.error(error_4);
                res.status(500).json({ error: '/api/leverage/fullData : Error fetching data' });
                return [3 /*break*/, 4];
            case 4: return [2 /*return*/];
        }
    });
}); });
app.get('/api/leverage/:symbol/:subdata/:timeframe', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, symbol, subdata, timeframe, symbolData, error_5;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _a = req.params, symbol = _a.symbol, subdata = _a.subdata, timeframe = _a.timeframe;
                _b.label = 1;
            case 1:
                _b.trys.push([1, 3, , 4]);
                return [4 /*yield*/, (0, convertData_1.convertPairToJSON)(bot.dataStore.get(consts_1.PAIR_TYPES.leveragePairs).get(symbol))];
            case 2:
                symbolData = _b.sent();
                res.status(200).json(symbolData[subdata][timeframe]);
                return [3 /*break*/, 4];
            case 3:
                error_5 = _b.sent();
                console.error(error_5);
                res.status(500).json({ error: '/api/leverage/fullData : Error fetching data' });
                return [3 /*break*/, 4];
            case 4: return [2 /*return*/];
        }
    });
}); });
// app.post('/api/rsi/bulk', async (req: Request, res: Response) => {
//     const { symbols, timeframes } = req.body;
//     if (!symbols || !timeframes) {
//         return res.status(400).send({ error: 'Symbols and timeframes are required.' });
//     }
//     const rsiValues = {};
//     for (let symbol of symbols) {
//         rsiValues[symbol] = {};
//         for (let timeframe of timeframes) {
//             try {
//                 const symbolData = bot.dataStore.get(PAIR_TYPES.leveragePairs).get(symbol);  // Change PAIR_TYPES.cryptoPairs based on your needs
//                 if (symbolData && symbolData.rsi && symbolData.rsi.has(timeframe)) {
//                     rsiValues[symbol][timeframe] = symbolData.rsi.get(timeframe).rsi;
//                 } else {
//                     rsiValues[symbol][timeframe] = null;
//                 }
//             } catch (error) {
//                 console.error(`Error fetching RSI from datastore for ${symbol} and ${timeframe}:`, error);
//             }
//         }
//     }
//     res.json(rsiValues);
// });
app.get('/api/lastRsi/bulk', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var leveragePairsResult, result;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, (0, convertData_1.stringifyMap)(bot.dataStore.get(consts_1.PAIR_TYPES.leveragePairs))];
            case 1:
                leveragePairsResult = _a.sent();
                result = {};
                Object.entries(leveragePairsResult).forEach(function (_a) {
                    var symbol = _a[0], pair = _a[1];
                    result[symbol] = { rsi: {}, details: pair.details };
                    Object.entries(pair.rsi).forEach(function (_a) {
                        var timeFrameKey = _a[0], data = _a[1];
                        var lastRSI = data.rsiData;
                        // console.log("🚀 ~ file: backend-server.ts:130 ~ Object.entries ~ timeFrameKey:", timeFrameKey, lastRSI, lastRSI.length)
                        if (data.rsiData.length > 0) {
                            result[symbol].rsi[timeFrameKey] = data.rsiData[data.rsiData.length - 1].value;
                        }
                        else {
                            result[symbol].rsi[timeFrameKey] = null;
                        }
                    });
                });
                return [2 /*return*/, res.status(200).json(result)];
        }
    });
}); });
app.get('/api/getDataStore', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var leveragePairsResult;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, (0, convertData_1.stringifyMap)(bot.dataStore.get(consts_1.PAIR_TYPES.leveragePairs))];
            case 1:
                leveragePairsResult = _a.sent();
                return [2 /*return*/, res.status(200).json(leveragePairsResult)];
        }
    });
}); });
// Tests 
app.get('/api/rsi/getValues', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var leveragePairsResult;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, (0, convertData_1.stringifyMap)(bot.dataStore.get(consts_1.PAIR_TYPES.leveragePairs))];
            case 1:
                leveragePairsResult = _a.sent();
                return [2 /*return*/, res.status(200).json(leveragePairsResult)];
        }
    });
}); });
app.get('/api/getSymbolValues/:symbol', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var symbol, symbolData, error_6;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                symbol = req.params.symbol;
                _a.label = 1;
            case 1:
                _a.trys.push([1, 3, , 4]);
                return [4 /*yield*/, (0, convertData_1.convertPairToJSON)(bot.dataStore.get(consts_1.PAIR_TYPES.leveragePairs).get(symbol))];
            case 2:
                symbolData = _a.sent();
                res.status(200).json(symbolData);
                return [3 /*break*/, 4];
            case 3:
                error_6 = _a.sent();
                console.error(error_6);
                res.status(500).json({ error: '/api/leverage/fullData : Error fetching data' });
                return [3 /*break*/, 4];
            case 4: return [2 /*return*/];
        }
    });
}); });
app.post('/set-rsi', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, pair, timeframe, rsiValues, assetPairData, rsiMap;
    return __generator(this, function (_b) {
        _a = req.body, pair = _a.pair, timeframe = _a.timeframe, rsiValues = _a.rsiValues;
        // Validate the request body
        if (!pair || !timeframe || !rsiValues || !Array.isArray(rsiValues)) {
            return [2 /*return*/, res.status(400).json({ error: 'Invalid request body' })];
        }
        assetPairData = bot.dataStore.get(pair);
        if (!assetPairData) {
            return [2 /*return*/, res.status(404).json({ error: 'Asset pair not found' })];
        }
        rsiMap = assetPairData.rsi;
        if (!rsiMap) {
            return [2 /*return*/, res.status(404).json({ error: 'RSI map not found' })];
        }
        // Set the new RSI values
        rsiMap.set(timeframe, rsiValues);
        res.status(200).json({ message: 'RSI values updated successfully' });
        return [2 /*return*/];
    });
}); });
app.get('/health', function (req, res) {
    try {
        res.status(200).json({
            refreshRate: bot.refreshRate
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error fetching health data' });
    }
});
var PORT = 3000;
app.listen(PORT, function () {
    console.log("Server is running on http://localhost:".concat(PORT));
    // bot.populateDataStore()
    bot.populateDataStoreParallel();
});
