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
var convertData_1 = require("./utils/convertData");
var bot_1 = require("./bot");
var bot = new bot_1.TradingBot('binance');
var express = require('express');
var cors = require('cors');
var bodyParser = require('bodyParser');
var app = express();
app.use(bodyParser.json());
// Enable CORS
app.use(cors());
// Data store
var ohlcvData = null;
// Fetch new data every 1 minute
var count = 0;
app.get('/api/data/:symbol/:timeframe', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, symbol, timeframe, ohlcvs, error_1;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _a = req.params, symbol = _a.symbol, timeframe = _a.timeframe;
                symbol = symbol.replace('-', '/');
                _b.label = 1;
            case 1:
                _b.trys.push([1, 3, , 4]);
                return [4 /*yield*/, bot.fetchOHLCV(symbol, timeframe)];
            case 2:
                ohlcvs = _b.sent();
                res.json(ohlcvs);
                return [3 /*break*/, 4];
            case 3:
                error_1 = _b.sent();
                console.error(error_1);
                res.status(500).json({ error: 'Error fetching data' });
                return [3 /*break*/, 4];
            case 4: return [2 /*return*/];
        }
    });
}); });
app.get('/bollinger-bands/:symbol/:timeframe', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, symbol, timeframe, ohlcv, bollingerBands;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _a = req.params, symbol = _a.symbol, timeframe = _a.timeframe;
                symbol = symbol.replace('-', '/');
                return [4 /*yield*/, bot.fetchOHLCV(symbol, timeframe)];
            case 1:
                ohlcv = _b.sent();
                bollingerBands = bot.calculateBollingerBands(ohlcv);
                res.send(bollingerBands);
                return [2 /*return*/];
        }
    });
}); });
app.get('/rsi/:symbol/:timeframe', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, symbol, timeframe, ohlcv, rsi;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _a = req.params, symbol = _a.symbol, timeframe = _a.timeframe;
                symbol = symbol.replace('-', '/');
                return [4 /*yield*/, bot.fetchOHLCV(symbol, timeframe)];
            case 1:
                ohlcv = (_b.sent());
                rsi = bot.calculateRSI(ohlcv);
                res.send(rsi);
                return [2 /*return*/];
        }
    });
}); });
// Setup POST route
app.post('/rsi', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var ohlcv, rsi;
    return __generator(this, function (_a) {
        ohlcv = req.body.ohlcv;
        // Ensure symbol and timeframe are provided
        if (!ohlcv) {
            return [2 /*return*/, res.status(400).send({ error: 'OHLCV are required.' })];
        }
        rsi = bot.calculateRSI(ohlcv);
        res.send({ rsi: rsi });
        return [2 /*return*/];
    });
}); });
app.get('/macd/:symbol/:timeframe', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, symbol, timeframe, ohlcv, macd;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _a = req.params, symbol = _a.symbol, timeframe = _a.timeframe;
                symbol = symbol.replace('-', '/');
                return [4 /*yield*/, bot.fetchOHLCV(symbol, timeframe)];
            case 1:
                ohlcv = _b.sent();
                macd = bot.calculateMACD(ohlcv);
                res.send(macd);
                return [2 /*return*/];
        }
    });
}); });
app.get('/volumes/:symbol/:timeframe', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, symbol, timeframe, ohlcv, volumes;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _a = req.params, symbol = _a.symbol, timeframe = _a.timeframe;
                symbol = symbol.replace('-', '/');
                return [4 /*yield*/, bot.fetchOHLCV(symbol, timeframe)];
            case 1:
                ohlcv = _b.sent();
                volumes = bot.calculateVolumes(ohlcv);
                res.send(volumes);
                return [2 /*return*/];
        }
    });
}); });
app.get('/api/support/:symbol/:timeframe', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, symbol, timeframe, ohlcvs, support;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _a = req.params, symbol = _a.symbol, timeframe = _a.timeframe;
                symbol = symbol.replace('-', '/');
                return [4 /*yield*/, bot.fetchOHLCV(symbol, timeframe)];
            case 1:
                ohlcvs = _b.sent();
                return [4 /*yield*/, bot.findLowestSupport(ohlcvs)];
            case 2:
                support = _b.sent();
                res.json({ support: support });
                return [2 /*return*/];
        }
    });
}); });
app.get('/api/historical/:symbol/:timeframe/:limit', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, symbol, timeframe, limit, pairType, symbolData, ohlcvs, latestData;
    return __generator(this, function (_b) {
        _a = req.params, symbol = _a.symbol, timeframe = _a.timeframe, limit = _a.limit;
        try {
            pairType = bot_1.PAIR_TYPES.leveragePairs;
            symbolData = bot.dataStore.get(pairType).get(symbol);
            if (!symbolData || !symbolData.ohlcvs.has(timeframe)) {
                res.status(404).json({ error: 'Data not found' });
                return [2 /*return*/];
            }
            ohlcvs = symbolData.ohlcvs.get(timeframe);
            latestData = ohlcvs.slice(-parseInt(limit));
            res.json(latestData);
        }
        catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Error fetching historical data' });
        }
        return [2 /*return*/];
    });
}); });
app.get('/api/resistance/:symbol/:timeframe', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, symbol, timeframe, ohlcvs, resistance;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _a = req.params, symbol = _a.symbol, timeframe = _a.timeframe;
                symbol = symbol.replace('-', '/');
                return [4 /*yield*/, bot.fetchOHLCV(symbol, timeframe)];
            case 1:
                ohlcvs = _b.sent();
                return [4 /*yield*/, bot.findTopResistance(ohlcvs)];
            case 2:
                resistance = _b.sent();
                res.json({ resistance: resistance });
                return [2 /*return*/];
        }
    });
}); });
app.get('/api/symbols/leverage', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var symbolsWithLeverage, error_2;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, bot.getBybitPairsWithLeverage()];
            case 1:
                symbolsWithLeverage = _a.sent();
                console.log("🚀 ~ file: backend-server.ts:129 ~ app.get ~ symbolsWithLeverage:", symbolsWithLeverage);
                res.json(symbolsWithLeverage);
                return [3 /*break*/, 3];
            case 2:
                error_2 = _a.sent();
                console.error(error_2);
                res.status(500).json({ error: 'Error fetching symbols with leverage' });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); });
app.post('/api/rsi/bulk', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, symbols, timeframes, rsiValues, _i, symbols_1, symbol, _b, timeframes_1, timeframe, symbolData;
    return __generator(this, function (_c) {
        _a = req.body, symbols = _a.symbols, timeframes = _a.timeframes;
        console.log("🚀 ~ file: backend-server.ts:149 ~ app.post ~ bot.dataStore:", bot.dataStore, symbols, timeframes);
        if (!symbols || !timeframes) {
            return [2 /*return*/, res.status(400).send({ error: 'Symbols and timeframes are required.' })];
        }
        rsiValues = {};
        for (_i = 0, symbols_1 = symbols; _i < symbols_1.length; _i++) {
            symbol = symbols_1[_i];
            rsiValues[symbol] = {};
            for (_b = 0, timeframes_1 = timeframes; _b < timeframes_1.length; _b++) {
                timeframe = timeframes_1[_b];
                try {
                    console.log("🚀 ~ file: backend-server.ts:150 ~ app.post ~ symbol:", symbol);
                    symbolData = bot.dataStore.get(bot_1.PAIR_TYPES.leveragePairs).get(symbol);
                    if (symbolData && symbolData.rsi && symbolData.rsi.has(timeframe)) {
                        rsiValues[symbol][timeframe] = symbolData.rsi.get(timeframe);
                    }
                    else {
                        rsiValues[symbol][timeframe] = null;
                    }
                }
                catch (error) {
                    console.error("Error fetching RSI from datastore for ".concat(symbol, " and ").concat(timeframe, ":"), error);
                }
            }
        }
        console.log("🚀 ~ file: backend-server.ts:162 ~ app.post ~ rsiValues:", rsiValues);
        res.json(rsiValues);
        return [2 /*return*/];
    });
}); });
// Tests 
app.get('/api/rsi/getValues', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var leveragePairsResult, stringified;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, convertData_1.default.stringifyMap(bot.dataStore[bot_1.PAIR_TYPES.leveragePairs])];
            case 1:
                leveragePairsResult = _a.sent();
                stringified = JSON.stringify(leveragePairsResult);
                console.log("🚀 ~ file: backend-server.ts:172 ~ app.get ~ leveragePairsResult:", stringified);
                return [2 /*return*/, res.status(200).json(leveragePairsResult)];
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
var PORT = 3000;
app.listen(PORT, function () {
    console.log("Server is running on http://localhost:".concat(PORT));
    bot.populateDataStore();
});
console.log("🚀 ~ file: backend-server.ts:203 ~ app:", app);
// module.exports = app;
exports.default = {};
