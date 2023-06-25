const express = require('express');
const cors = require('cors');

import { analyzeData } from './strategyAnalyzer';

// Your other imports, constants, and functions...

const app = express();

// Enable CORS
app.use(cors());

// Global store for the latest data and signals
let RSI_latestDataAndSignals = null;
let Complete_latestDataAndSignals = null;

const symbols = [
    'BTC-USDT',
    'ETH-USDT',
    'BNB-USDT',
    // 'USDT-XRP',
    'DOGE-USDT',
    'DOT-USDT',
    'UNI-USDT',
    'BCH-USDT',
    'LTC-USDT',
];
const timeframes = ['5m', '1h', '4h', '1d', '1w'];

// Global store for the latest data and signals
let latestDataAndSignals = {};
let signalStatus = {};


setInterval(async () => {
    for (let symbol of symbols) {
        for (let timeframe of timeframes) {
            let RSI_latestDataAndSignals = await analyzeData(symbol, timeframe, 'RSI', signalStatus);
            let Complete_latestDataAndSignals = await analyzeData(symbol, timeframe, 'COMPLETE_ANALYSIS', signalStatus);

            if (!latestDataAndSignals[symbol]) {
                latestDataAndSignals[symbol] = {};
            }
            if (!latestDataAndSignals[symbol][timeframe]) {
                latestDataAndSignals[symbol][timeframe] = {};
            }

            latestDataAndSignals[symbol][timeframe]['RSI'] = RSI_latestDataAndSignals;
            latestDataAndSignals[symbol][timeframe]['COMPLETE_ANALYSIS'] = Complete_latestDataAndSignals;

            if (RSI_latestDataAndSignals[1].buySignal) {
                console.log(`RSI : Buy signal for ${symbol} on ${timeframe} timeframe!`);
            } else if (RSI_latestDataAndSignals[1].sellSignal) {
                console.log(`RSI : Sell signal for ${symbol} on ${timeframe} timeframe!`);
            }
            if (Complete_latestDataAndSignals[1].buySignal) {
                console.log(`Complete : Buy signal for ${symbol} on ${timeframe} timeframe!`);
            } else if (Complete_latestDataAndSignals[1].sellSignal) {
                console.log(`Complete : Sell signal for ${symbol} on ${timeframe} timeframe!`);
            }
        }
    }
}, 3 * 1000);

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

app.listen(3002, () => {
    console.log('Analyzer server is running on http://localhost:3002');
});
