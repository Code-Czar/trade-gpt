const express = require('express');
const cors = require('cors');
const fs = require('fs');
const https = require('https');
const fetch = require('node-fetch');

const dotenv = require('dotenv');
const path = require('path');
dotenv.config({ path: path.join(__dirname, '.env') });

console.log("Current directory:", process.cwd());


import { SERVER_PORTS } from 'shared';

import { analyzeData, fetchRSIAndCheckThreshold } from './strategyAnalyzer';
import { sendSignalEmail } from './email';
import { sendNotification } from './notificationsSender';
import { BackendClient } from './backendWebSocket';

const mode = process.env.MODE;

let httpsOptions = {};
if (mode === 'PRODUCTION') {
    const certificatePath = '/etc/letsencrypt/live/beniben.hopto.org/';
    const key = fs.readFileSync(`${certificatePath}/privkey.pem`);
    const cert = fs.readFileSync(`${certificatePath}/fullchain.pem`);
    console.log('🚀 ~ file: strategyAnalyzerServer.ts:13 ~ key:', key, cert);
    httpsOptions = {
        key: key,
        cert: cert,
    };
}

const app = express();
https.createServer(httpsOptions, app).listen(SERVER_PORTS.STRATEGY_ANALYZER_PORT, () => {
    console.log('Server running ');
});
app.use(cors());

app.get('/health', (req, res) => {
    res.send('Hello over HTTPS!');
});

// Enable CORS

// Global store for the latest data and signals
let RSI_latestDataAndSignals = null;
let Complete_latestDataAndSignals = null;

// Global store for the latest data and signals
let latestDataAndSignals = {};
let signalStatus = {};

function delay(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}
const postOHLCVData = async (ohlcvData, url) => {
    console.log('🚀 ~ file: strategyAnalyzerServer.ts:91 ~ postOHLCVData ~ ohlcvData:', ohlcvData);
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ ohlcv: ohlcvData }),
        });

        // Handle the response as needed
        const jsonResponse = await response.json();
        console.log(jsonResponse);
        return jsonResponse;
    } catch (error) {
        console.error('Error posting OHLCV data:', error);
    }
};

// Route to serve the latest data and signals
app.get('/api/:analysisType/data-and-signals', (req, res) => {
    const analysisType = req.params.analysisType;

    switch (analysisType) {
        case 'RSI':
            if (RSI_latestDataAndSignals) {
                res.json(RSI_latestDataAndSignals);
            } else {
                res.status(404).json({ error: 'Data not yet available' });
            }
            break;

        case 'COMPLETE_ANALYSIS':
            if (Complete_latestDataAndSignals) {
                res.json(Complete_latestDataAndSignals);
            } else {
                res.status(404).json({ error: 'Data not yet available' });
            }
            break;
        // Add other cases as necessary
        default:
            res.status(400).json({ error: `Invalid analysis type: ${analysisType}` });
    }
});

// Route to serve only the latest data
app.get('/api/:analysisType/data', (req, res) => {
    const analysisType = req.params.analysisType;

    switch (analysisType) {
        case 'RSI':
            if (RSI_latestDataAndSignals) {
                res.json(RSI_latestDataAndSignals[0]);
            } else {
                res.status(404).json({ error: 'Data not yet available' });
            }
            break;

        case 'COMPLETE_ANALYSIS':
            if (Complete_latestDataAndSignals) {
                res.json(Complete_latestDataAndSignals[0]);
            } else {
                res.status(404).json({ error: 'Data not yet available' });
            }
            break;
        // Add other cases as necessary
        default:
            res.status(400).json({ error: `Invalid analysis type: ${analysisType}` });
    }
});

// Route to serve only the latest signals
app.get('/api/:analysisType/signals', (req, res) => {
    const analysisType = req.params.analysisType;

    switch (analysisType) {
        case 'RSI':
            if (RSI_latestDataAndSignals) {
                res.json(RSI_latestDataAndSignals[1]);
            } else {
                res.status(404).json({ error: 'Signals not yet available' });
            }
            break;
        case 'COMPLETE_ANALYSIS':
            if (Complete_latestDataAndSignals) {
                res.json(Complete_latestDataAndSignals[1]);
            } else {
                res.status(404).json({ error: 'Data not yet available' });
            }
            break;
        // Add other cases as necessary
        default:
            res.status(400).json({ error: `Invalid analysis type: ${analysisType}` });
    }
});

app.get('/api/:symbol/:timeframe/:analysisType/data-and-signals', (req, res) => {
    const { symbol, timeframe, analysisType } = req.params;

    if (
        latestDataAndSignals[symbol] &&
        latestDataAndSignals[symbol][timeframe] &&
        latestDataAndSignals[symbol][timeframe][analysisType]
    ) {
        res.json(latestDataAndSignals[symbol][timeframe][analysisType]);
    } else {
        res.status(404).json({ error: 'Data not yet available' });
    }
});
app.post('/api/test-email', async (req, res) => {
    // Send the test email
    await sendSignalEmail('longTest', 'SymbolTest', '1dTest', 'RSITest', true);
    res.status(200).json({ info: 'Complete' });
});
app.post('/api/test-notification', async (req, res) => {
    // Send the test email
    await sendNotification('Notification Test');
    res.status(200).json({ info: 'Complete' });
});

async function loopFetchRSIAndCheckThreshold() {
    while (true) {
        try {
            // await fetchCryptos()
            await fetchRSIAndCheckThreshold();
        } catch (error) {
            console.error(error);
        }
        // Wait for 10 seconds before the next iteration.
        await new Promise((resolve) => setTimeout(resolve, 10 * 1000));
    }
}

// Start the loop
const client = new BackendClient();


// loopFetchRSIAndCheckThreshold();

// setTimeout(async () => {
//     await fetchForex();
// }, 5 * 1000);

export default app;
