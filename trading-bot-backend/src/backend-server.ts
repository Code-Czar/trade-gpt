// // import express, { Request, Response } from 'express';
// import cors from 'cors';
// import bodyParser from 'body-parser';
import { PAIR_TYPES } from './types/consts';
import { stringifyMap, convertPairToJSON } from './utils/convertData';
import { cryptoFetcher } from './dataFetchers';
const { TradingBot } = require('./bot');


const bot = new TradingBot('binance');
const express = require('express');
// const { Request, Response } = require('express');
const cors = require('cors');
// const bodyParser = require('bodyParser');
const bodyParser = require('body-parser')
// const dataConvertor = require('./utils/convertData')

const app = express();

app.use(bodyParser.json());

// Enable CORS
app.use(cors());



// Fetch new data every 1 minute
let count = 0;

app.get('/api/symbols/leverage', async (req: Request, res: Response) => {
    try {
        const symbolsWithLeverage = await cryptoFetcher.getBybitPairsWithLeverage();
        res.status(200).json(symbolsWithLeverage);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error fetching symbols with leverage' });
    }
});


app.get('/api/leverage/fullData/:symbol', async (req: Request, res: Response) => {
    let { symbol } = req.params;
    try {
        const symbolData = await convertPairToJSON(bot.dataStore.get(PAIR_TYPES.leveragePairs).get(symbol))
        res.status(200).json(symbolData);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: '/api/leverage/fullData : Error fetching data' });
    }
});
app.get('/api/leverage/fullData/:symbol/:timeframe', async (req: Request, res: Response) => {
    let { symbol, timeframe } = req.params;
    try {
        const symbolData = await convertPairToJSON(bot.dataStore.get(PAIR_TYPES.leveragePairs).get(symbol))
        const result = {}
        Object.entries(symbolData).forEach(([key, value]) => {
            if (value[timeframe]) {
                result[key] = value[timeframe]
            }
        })
        res.status(200).json(result);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: '/api/leverage/fullData : Error fetching data' });
    }
});

// Retrieves OHLCV, RSI, SMA, EMA, MACD, VOLUMES, Bollinger Bands
app.get('/api/leverage/:symbol/:subdata', async (req: Request, res: Response) => {
    let { symbol, subdata } = req.params;
    try {
        const symbolData = await convertPairToJSON(bot.dataStore.get(PAIR_TYPES.leveragePairs).get(symbol))
        res.status(200).json(symbolData[subdata]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: '/api/leverage/fullData : Error fetching data' });
    }
});

app.get('/api/leverage/:symbol/:subdata/:timeframe', async (req: Request, res: Response) => {
    let { symbol, subdata, timeframe } = req.params;
    try {
        const symbolData = await convertPairToJSON(bot.dataStore.get(PAIR_TYPES.leveragePairs).get(symbol))
        res.status(200).json(symbolData[subdata][timeframe]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: '/api/leverage/fullData : Error fetching data' });
    }
});





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

app.get('/api/lastRsi/bulk', async (req: Request, res: Response) => {

    const leveragePairsResult = await stringifyMap(bot.dataStore.get(PAIR_TYPES.leveragePairs))
    const result = {}
    Object.entries(leveragePairsResult).forEach(([symbol, pair]) => {
        result[symbol] = { rsi: {}, details: pair.details }

        Object.entries(pair.rsi).forEach(([timeFrameKey, data]) => {
            const lastRSI = data.rsiData
            // console.log("🚀 ~ file: backend-server.ts:130 ~ Object.entries ~ timeFrameKey:", timeFrameKey, lastRSI, lastRSI.length)
            if (data.rsiData.length > 0) {

                result[symbol].rsi[timeFrameKey] = data.rsiData[data.rsiData.length - 1].value
            }
            else {
                result[symbol].rsi[timeFrameKey] = null
            }
        });
    })

    return res.status(200).json(result)
})
app.get('/api/getDataStore', async (req: Request, res: Response) => {
    const leveragePairsResult = await stringifyMap(bot.dataStore.get(PAIR_TYPES.leveragePairs))
    return res.status(200).json(leveragePairsResult)
})

// Tests 
app.get('/api/rsi/getValues', async (req: Request, res: Response) => {
    const leveragePairsResult = await stringifyMap(bot.dataStore.get(PAIR_TYPES.leveragePairs))
    return res.status(200).json(leveragePairsResult)
})
app.get('/api/getSymbolValues/:symbol', async (req: Request, res: Response) => {
    let { symbol } = req.params;
    try {
        const symbolData = await convertPairToJSON(bot.dataStore.get(PAIR_TYPES.leveragePairs).get(symbol))
        res.status(200).json(symbolData);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: '/api/leverage/fullData : Error fetching data' });
    }
});

app.post('/set-rsi', async (req: Request, res: Response) => {
    const { pair, timeframe, rsiValues } = req.body;

    // Validate the request body
    if (!pair || !timeframe || !rsiValues || !Array.isArray(rsiValues)) {
        return res.status(400).json({ error: 'Invalid request body' });
    }

    // Navigate to the specific asset pair and timeframe
    const assetPairData = bot.dataStore.get(pair);
    if (!assetPairData) {
        return res.status(404).json({ error: 'Asset pair not found' });
    }
    const rsiMap = assetPairData.rsi;
    if (!rsiMap) {
        return res.status(404).json({ error: 'RSI map not found' });
    }

    // Set the new RSI values
    rsiMap.set(timeframe, rsiValues);

    res.status(200).json({ message: 'RSI values updated successfully' });
});

app.get('/health', (req, res) => {
    try {
        res.status(200).json({
            refreshRate: bot.refreshRate
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error fetching health data' });
    }
});



const PORT = 3000;

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
    // bot.populateDataStore()
    bot.populateDataStoreParallel()
});

