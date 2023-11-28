"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var trading_shared_1 = require("trading-shared");
global.logger = new trading_shared_1.VersatileLogger('StrategyAnalyzerServer', true, true);
var express = require('express');
var cors = require('cors');
var fs = require('fs');
var https = require('https');
var http = require('http'); // Import the HTTP module
var fetch = require('node-fetch');
var dotenv = require('dotenv');
var path = require('path');
dotenv.config({ path: path.join(__dirname, '.env') });
global.logger.debug('Current directory:', process.cwd());
var trading_shared_2 = require("trading-shared");
var backendWebSocket_1 = require("./backendWebSocket");
var strategyAnalyzerClass_1 = require("./strategyAnalyzerClass");
var mode = process.env.MODE;
var httpsOptions = {};
var server;
var app = express();
if (mode === 'PRODUCTION') {
    //const certificatePath = '/etc/letsencrypt/live/beniben.hopto.org/';
    var certificatePath = '/etc/letsencrypt/live/hosaka.freeboxos.fr/';
    var key = fs.readFileSync("".concat(certificatePath, "/privkey.pem"));
    var cert = fs.readFileSync("".concat(certificatePath, "/fullchain.pem"));
    global.logger.debug('🚀 ~ file: strategyAnalyzerServer.ts:13 ~ key:', key, cert);
    httpsOptions = {
        key: key,
        cert: cert,
    };
    server = https.createServer(httpsOptions, app);
}
else {
    // Use HTTP for DEV mode
    server = http.createServer(app);
}
server.listen(trading_shared_2.SERVER_PORTS.STRATEGY_ANALYZER_PORT, function () {
    global.logger.debug("SA Server running on port ".concat(trading_shared_2.SERVER_PORTS.STRATEGY_ANALYZER_PORT));
});
app.use(cors());
// Start the loop
var strategyAnalyzer = new strategyAnalyzerClass_1.StrategyAnalyzer();
var client = new backendWebSocket_1.BackendClient(strategyAnalyzer);
app.get('/health', function (req, res) {
    res.status(200).send('Hello from SA!');
});
app.get('/api/getRSISignals/:symbolName', function (req, res) {
    var symbolName = req.params.symbolName;
    if (strategyAnalyzer.pastRSISignals[symbolName]) {
        {
            res.status(200).json(strategyAnalyzer.pastRSISignals[symbolName]);
        }
    }
    res.status(404).send('No RSI signals found for this symbol');
});
app.get('/api/getEMA28Signals/:symbolName', function (req, res) {
    var symbolName = req.params.symbolName;
    if (strategyAnalyzer.pastEMA28Signals[symbolName]) {
        {
            res.status(200).json(strategyAnalyzer.pastEMA28Signals[symbolName]);
        }
    }
    res.status(404).send('No EMA28 signals found for this symbol');
});
exports.default = app;
