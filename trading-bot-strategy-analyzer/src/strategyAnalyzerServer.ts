const express = require('express');
const cors = require('cors');
const fs = require('fs');
const https = require('https');
const fetch = require('node-fetch');

require('dotenv').config();

import { SERVER_DATA_URL } from './consts';



import { analyzeData, fetchRSIAndCheckThreshold } from './strategyAnalyzer';
import { sendSignalEmail } from './email';

const mode = process.env.MODE;





let httpsOptions = {};
// if (mode === 'PRODUCTION') {
//     const certificatePath = "/etc/letsencrypt/live/beniben.hopto.org/"
//     const key = fs.readFileSync(`${certificatePath}/privkey.pem`)
//     const cert = fs.readFileSync(`${certificatePath}/fullchain.pem`)
//     console.log("🚀 ~ file: strategyAnalyzerServer.ts:13 ~ key:", key, cert)
//     httpsOptions = {
//         key: key,
//         cert: cert,
//     };
// }

console.log("🚀 ~ file: strategyAnalyzerServer.ts:15 ~ mode:", mode, httpsOptions)

// Your other imports, constants, and functions...

const app = express();
https.createServer(httpsOptions, app).listen(3002, () => {
    console.log('Server running on https://localhost:3002');
});

app.get('/', (req, res) => {
    res.send('Hello over HTTPS!');
});

// Enable CORS
app.use(cors());

// Global store for the latest data and signals
let RSI_latestDataAndSignals = null;
let Complete_latestDataAndSignals = null;

const cryptoSymbols = [
    'BTC-USDT',
    'ETH-USDT',
    'LTC-USDT',
    'XRP-USDT',
    'BNB-USDT',
    'AAVE-USDT',
    'ADA-USDT',
    'ALGO-USDT',
    'ATOM-USDT',
    'AVAX-USDT',
    'AXS-USDT',
    'BAT-USDT',
    'CHZ-USDT',
    'COMP-USDT',
    'CRV-USDT',
    'DOGE-USDT',
    'DOT-USDT',
    'EGLD-USDT',
    'EOS-USDT',
    'ETC-USDT',
    'FIL-USDT',
    'LINK-USDT',
    'LRC-USDT',
    'LTC-USDT',
    'MATIC-USDT',
    'MKR-USDT',
    'NEO-USDT',
    'OMG-USDT',
    'ONE-USDT',
    'QTUM-USDT',
    'REN-USDT',
    'RSR-USDT',
    'RVN-USDT',
    'SAND-USDT',
    'SHIB-USDT',
    'SNX-USDT',
    'SOL-USDT',
    'SUSHI-USDT',
    'SXP-USDT',
    'TRX-USDT',
    'UNI-USDT',
    'VET-USDT',
    'XLM-USDT',
    'XMR-USDT',
    'XTZ-USDT',
    'YFI-USDT',
    'ZEC-USDT',
    'ZEN-USDT',
    'ZIL-USDT',
    'ZRX-USDT'
];

const forexPairs = [
    "EUR-USD", "USD-JPY", "GBP-USD", "USD-CHF", "USD-CAD", "AUD-USD", "NZD-USD",
    "EUR-GBP", "EUR-AUD", "GBP-JPY", "CHF-JPY", "EUR-CAD", "AUD-CAD", "CAD-JPY", "NZD-JPY",
    "GBP-CAD", "GBP-NZD", "GBP-AUD", "EUR-NZD", "AUD-NZD", "AUD-JPY", "USD-SGD", "USD-HKD",
    "USD-TRY", "EUR-TRY", "USD-INR", "USD-MXN", "USD-ZAR", "USD-THB"
];


const binanceTimeframes = ['1m', '5m', '1h', '4h', '1d', '1w'];
// const forexTimeframes = ['1min', '5min', '15min', '30min', '60min', 'daily', 'weekly', 'monthly'];
const forexTimeframes = ['60min'];

// Global store for the latest data and signals
let latestDataAndSignals = {};
let signalStatus = {};

function delay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
const postOHLCVData = async (ohlcvData, url) => {
    console.log("🚀 ~ file: strategyAnalyzerServer.ts:91 ~ postOHLCVData ~ ohlcvData:", ohlcvData)
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ ohlcv: ohlcvData })
        });

        // Handle the response as needed
        const jsonResponse = await response.json();
        console.log(jsonResponse);
        return jsonResponse
    } catch (error) {
        console.error('Error posting OHLCV data:', error);
    }
};

async function fetchCryptos() {
    for (let symbol of cryptoSymbols) {
        for (let timeframe of binanceTimeframes) {
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

            if (RSI_latestDataAndSignals && RSI_latestDataAndSignals[1].buySignal) {
                // console.log(`RSI : Buy signal for ${symbol} on ${timeframe} timeframe!`);
            } else if (RSI_latestDataAndSignals && RSI_latestDataAndSignals[1].sellSignal) {
                // console.log(`RSI : Sell signal for ${symbol} on ${timeframe} timeframe!`);
            }
            if (Complete_latestDataAndSignals && Complete_latestDataAndSignals[1].buySignal) {
                // console.log(`Complete : Buy signal for ${symbol} on ${timeframe} timeframe!`);
            } else if (Complete_latestDataAndSignals && Complete_latestDataAndSignals[1].sellSignal) {
                // console.log(`Complete : Sell signal for ${symbol} on ${timeframe} timeframe!`);
            }
        }
    }
}
async function fetchForex() {
    while (true) {
        for (let symbol of forexPairs) {
            for (let timeframe of forexTimeframes) {
                console.log("🚀 ~ file: strategyAnalyzerServer.ts:120 ~ fetchForex ~ symbol:", symbol)
                console.log("🚀 ~ file: strategyAnalyzerServer.ts:121 ~ fetchForex ~ timeframe:", timeframe)
                try {
                    const response = await fetch(`http://localhost:3000/api/data/${symbol}/${timeframe}`)
                    const data = await response.json()
                    const rsi = await postOHLCVData(data, 'http://localhost:3000/rsi')

                    console.log("🚀 ~ file: strategyAnalyzerServer.ts:129 ~ fetchForex ~ response:", data)
                    fs.writeFileSync(`src/outputData/rsiDataSignals-${symbol}-${timeframe}.json`, JSON.stringify(data));
                    fs.writeFileSync(`src/outputData/rsiData-${symbol}-${timeframe}.json`, JSON.stringify(rsi));

                } catch (error) {
                    console.error("🚀 ~ file: strategyAnalyzerServer.ts:120 ~ fetchForex ~ error:", error)

                }
                await delay(30000);
            }
        }
    }

}



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
    await sendSignalEmail("longTest", "SymbolTest", "1dTest", 'RSITest', true);
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
        await new Promise(resolve => setTimeout(resolve, 10 * 1000));
    }
}

// Start the loop
loopFetchRSIAndCheckThreshold();

setTimeout(async () => {
    await fetchForex()
}, 5 * 1000);


export default app;