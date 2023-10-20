const express = require('express');
const cors = require('cors');
const fs = require('fs');
const https = require('https');
const http = require('http'); // Import the HTTP module

const fetch = require('node-fetch');

const dotenv = require('dotenv');
const path = require('path');
dotenv.config({ path: path.join(__dirname, '.env') });

console.log('Current directory:', process.cwd());

import { SERVER_PORTS } from 'trading-shared';

import { BackendClient } from './backendWebSocket';
import { StrategyAnalyzer } from './strategyAnalyzerClass';

const mode = process.env.MODE;

let httpsOptions = {};
let server;

const app = express();

if (mode === 'PRODUCTION') {
    const certificatePath = '/etc/letsencrypt/live/beniben.hopto.org/';
    const key = fs.readFileSync(`${certificatePath}/privkey.pem`);
    const cert = fs.readFileSync(`${certificatePath}/fullchain.pem`);
    console.log('🚀 ~ file: strategyAnalyzerServer.ts:13 ~ key:', key, cert);
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
server.listen(SERVER_PORTS.STRATEGY_ANALYZER_PORT, () => {
    console.log(`SA Server running on port ${SERVER_PORTS.STRATEGY_ANALYZER_PORT}`);
});
app.use(cors());

// Start the loop
const strategyAnalyzer = new StrategyAnalyzer();
const client = new BackendClient(strategyAnalyzer);

app.get('/health', (req, res) => {
    res.status(200).send('Hello from SA!');
});



app.get('/api/getRSISignals/:symbolName', (req, res) => {
    const { symbolName } = req.params;
    if (strategyAnalyzer.pastRSISignals[symbolName]) {
        {
            res.status(200).json(strategyAnalyzer.pastRSISignals[symbolName]);
        }
    }
    res.status(404).send('No RSI signals found for this symbol');
});
app.get('/api/getEMA28Signals/:symbolName', (req, res) => {
    const { symbolName } = req.params;
    if (strategyAnalyzer.pastEMA28Signals[symbolName]) {
        {
            res.status(200).json(strategyAnalyzer.pastEMA28Signals[symbolName]);
        }
    }
    res.status(404).send('No EMA28 signals found for this symbol');
});

export default app;
