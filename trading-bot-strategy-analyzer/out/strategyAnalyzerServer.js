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
var express = require('express');
var cors = require('cors');
var fs = require('fs');
var https = require('https');
var fetch = require('node-fetch');
var dotenv = require('dotenv');
var path = require('path');
dotenv.config({ path: path.join(__dirname, '.env') });
console.log("Current directory:", process.cwd());
var shared_1 = require("shared");
var strategyAnalyzer_1 = require("./strategyAnalyzer");
var email_1 = require("./email");
var notificationsSender_1 = require("./notificationsSender");
var backendWebSocket_1 = require("./backendWebSocket");
var mode = process.env.MODE;
var httpsOptions = {};
if (mode === 'PRODUCTION') {
    var certificatePath = '/etc/letsencrypt/live/beniben.hopto.org/';
    var key = fs.readFileSync("".concat(certificatePath, "/privkey.pem"));
    var cert = fs.readFileSync("".concat(certificatePath, "/fullchain.pem"));
    console.log('🚀 ~ file: strategyAnalyzerServer.ts:13 ~ key:', key, cert);
    httpsOptions = {
        key: key,
        cert: cert,
    };
}
var app = express();
https.createServer(httpsOptions, app).listen(shared_1.SERVER_PORTS.STRATEGY_ANALYZER_PORT, function () {
    console.log('Server running ');
});
app.use(cors());
app.get('/health', function (req, res) {
    res.send('Hello over HTTPS!');
});
// Enable CORS
// Global store for the latest data and signals
var RSI_latestDataAndSignals = null;
var Complete_latestDataAndSignals = null;
// Global store for the latest data and signals
var latestDataAndSignals = {};
var signalStatus = {};
function delay(ms) {
    return new Promise(function (resolve) { return setTimeout(resolve, ms); });
}
var postOHLCVData = function (ohlcvData, url) { return __awaiter(void 0, void 0, void 0, function () {
    var response, jsonResponse, error_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                console.log('🚀 ~ file: strategyAnalyzerServer.ts:91 ~ postOHLCVData ~ ohlcvData:', ohlcvData);
                _a.label = 1;
            case 1:
                _a.trys.push([1, 4, , 5]);
                return [4 /*yield*/, fetch(url, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ ohlcv: ohlcvData }),
                    })];
            case 2:
                response = _a.sent();
                return [4 /*yield*/, response.json()];
            case 3:
                jsonResponse = _a.sent();
                console.log(jsonResponse);
                return [2 /*return*/, jsonResponse];
            case 4:
                error_1 = _a.sent();
                console.error('Error posting OHLCV data:', error_1);
                return [3 /*break*/, 5];
            case 5: return [2 /*return*/];
        }
    });
}); };
// Route to serve the latest data and signals
app.get('/api/:analysisType/data-and-signals', function (req, res) {
    var analysisType = req.params.analysisType;
    switch (analysisType) {
        case 'RSI':
            if (RSI_latestDataAndSignals) {
                res.json(RSI_latestDataAndSignals);
            }
            else {
                res.status(404).json({ error: 'Data not yet available' });
            }
            break;
        case 'COMPLETE_ANALYSIS':
            if (Complete_latestDataAndSignals) {
                res.json(Complete_latestDataAndSignals);
            }
            else {
                res.status(404).json({ error: 'Data not yet available' });
            }
            break;
        // Add other cases as necessary
        default:
            res.status(400).json({ error: "Invalid analysis type: ".concat(analysisType) });
    }
});
// Route to serve only the latest data
app.get('/api/:analysisType/data', function (req, res) {
    var analysisType = req.params.analysisType;
    switch (analysisType) {
        case 'RSI':
            if (RSI_latestDataAndSignals) {
                res.json(RSI_latestDataAndSignals[0]);
            }
            else {
                res.status(404).json({ error: 'Data not yet available' });
            }
            break;
        case 'COMPLETE_ANALYSIS':
            if (Complete_latestDataAndSignals) {
                res.json(Complete_latestDataAndSignals[0]);
            }
            else {
                res.status(404).json({ error: 'Data not yet available' });
            }
            break;
        // Add other cases as necessary
        default:
            res.status(400).json({ error: "Invalid analysis type: ".concat(analysisType) });
    }
});
// Route to serve only the latest signals
app.get('/api/:analysisType/signals', function (req, res) {
    var analysisType = req.params.analysisType;
    switch (analysisType) {
        case 'RSI':
            if (RSI_latestDataAndSignals) {
                res.json(RSI_latestDataAndSignals[1]);
            }
            else {
                res.status(404).json({ error: 'Signals not yet available' });
            }
            break;
        case 'COMPLETE_ANALYSIS':
            if (Complete_latestDataAndSignals) {
                res.json(Complete_latestDataAndSignals[1]);
            }
            else {
                res.status(404).json({ error: 'Data not yet available' });
            }
            break;
        // Add other cases as necessary
        default:
            res.status(400).json({ error: "Invalid analysis type: ".concat(analysisType) });
    }
});
app.get('/api/:symbol/:timeframe/:analysisType/data-and-signals', function (req, res) {
    var _a = req.params, symbol = _a.symbol, timeframe = _a.timeframe, analysisType = _a.analysisType;
    if (latestDataAndSignals[symbol] &&
        latestDataAndSignals[symbol][timeframe] &&
        latestDataAndSignals[symbol][timeframe][analysisType]) {
        res.json(latestDataAndSignals[symbol][timeframe][analysisType]);
    }
    else {
        res.status(404).json({ error: 'Data not yet available' });
    }
});
app.post('/api/test-email', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: 
            // Send the test email
            return [4 /*yield*/, (0, email_1.sendSignalEmail)('longTest', 'SymbolTest', '1dTest', 'RSITest', true)];
            case 1:
                // Send the test email
                _a.sent();
                res.status(200).json({ info: 'Complete' });
                return [2 /*return*/];
        }
    });
}); });
app.post('/api/test-notification', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: 
            // Send the test email
            return [4 /*yield*/, (0, notificationsSender_1.sendNotification)('Notification Test')];
            case 1:
                // Send the test email
                _a.sent();
                res.status(200).json({ info: 'Complete' });
                return [2 /*return*/];
        }
    });
}); });
function loopFetchRSIAndCheckThreshold() {
    return __awaiter(this, void 0, void 0, function () {
        var error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!true) return [3 /*break*/, 6];
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    // await fetchCryptos()
                    return [4 /*yield*/, (0, strategyAnalyzer_1.fetchRSIAndCheckThreshold)()];
                case 2:
                    // await fetchCryptos()
                    _a.sent();
                    return [3 /*break*/, 4];
                case 3:
                    error_2 = _a.sent();
                    console.error(error_2);
                    return [3 /*break*/, 4];
                case 4: 
                // Wait for 10 seconds before the next iteration.
                return [4 /*yield*/, new Promise(function (resolve) { return setTimeout(resolve, 10 * 1000); })];
                case 5:
                    // Wait for 10 seconds before the next iteration.
                    _a.sent();
                    return [3 /*break*/, 0];
                case 6: return [2 /*return*/];
            }
        });
    });
}
// Start the loop
var client = new backendWebSocket_1.BackendClient();
// loopFetchRSIAndCheckThreshold();
// setTimeout(async () => {
//     await fetchForex();
// }, 5 * 1000);
exports.default = app;