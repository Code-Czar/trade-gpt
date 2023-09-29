import express, { Request, Response } from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import dataConvertor from './utils';

import { PAIR_TYPES, TradingBot } from './bot';

const bot = new TradingBot('binance');

const app: express.Application = express();

app.use(bodyParser.json());

// Enable CORS
app.use(cors());

// Data store
let ohlcvData = null;

// Fetch new data every 1 minute
let count = 0;

app.get('/api/data/:symbol/:timeframe', async (req: Request, res: Response) => {
    let { symbol, timeframe } = req.params;
    symbol = symbol.replace('-', '/');
    try {
        const ohlcvs = await bot.fetchOHLCV(symbol, timeframe);
        res.json(ohlcvs);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error fetching data' });
    }
});

app.get('/bollinger-bands/:symbol/:timeframe', async (req: Request, res: Response) => {
    let { symbol, timeframe } = req.params;
    symbol = symbol.replace('-', '/');
    const ohlcv = await bot.fetchOHLCV(symbol, timeframe);
    const bollingerBands = bot.calculateBollingerBands(ohlcv);
    res.send(bollingerBands);
});

app.get('/rsi/:symbol/:timeframe', async (req: Request, res: Response) => {
    let { symbol, timeframe } = req.params;
    symbol = symbol.replace('-', '/');
    const ohlcv = (await bot.fetchOHLCV(symbol, timeframe)) as Array<number> | null;
    const rsi = bot.calculateRSI(ohlcv);
    res.send(rsi);
});
// Setup POST route
app.post('/rsi', async (req: Request, res: Response) => {
    const { ohlcv } = req.body;

    // Ensure symbol and timeframe are provided
    if (!ohlcv) {
        return res.status(400).send({ error: 'OHLCV are required.' });
    }
    const rsi = bot.calculateRSI(ohlcv);
    res.send({ rsi });
});


app.get('/macd/:symbol/:timeframe', async (req: Request, res: Response) => {
    let { symbol, timeframe } = req.params;
    symbol = symbol.replace('-', '/');
    const ohlcv = await bot.fetchOHLCV(symbol, timeframe);
    const macd = bot.calculateMACD(ohlcv);
    res.send(macd);
});

app.get('/volumes/:symbol/:timeframe', async (req: Request, res: Response) => {
    let { symbol, timeframe } = req.params;
    symbol = symbol.replace('-', '/');
    const ohlcv = await bot.fetchOHLCV(symbol, timeframe);
    const volumes = bot.calculateVolumes(ohlcv);
    res.send(volumes);
});

app.get('/api/support/:symbol/:timeframe', async (req: Request, res: Response) => {
    let { symbol, timeframe } = req.params;
    symbol = symbol.replace('-', '/');
    const ohlcvs = await bot.fetchOHLCV(symbol, timeframe);
    const support = await bot.findLowestSupport(ohlcvs);
    res.json({ support });
});

app.get('/api/historical/:symbol/:timeframe/:limit', async (req: Request, res: Response) => {
    const { symbol, timeframe, limit } = req.params;

    try {
        // Determine the type of the pair (this might require a helper function or logic)
        // For demonstration purposes, I'm assuming the symbol belongs to 'leveragePairs'.
        // But in a real-world scenario, you might want to determine the exact pair type 
        // dynamically or by some other means.
        const pairType = PAIR_TYPES.leveragePairs; // or forexPairs, cryptoPairs, etc.

        // Access the bot's dataStore to get the stored data
        const symbolData = bot.dataStore.get(pairType).get(symbol);

        if (!symbolData || !symbolData.ohlcvs.has(timeframe)) {
            res.status(404).json({ error: 'Data not found' });
            return;
        }

        const ohlcvs = symbolData.ohlcvs.get(timeframe);

        // Return only the latest data up to the limit
        const latestData = ohlcvs.slice(-parseInt(limit));

        res.json(latestData);

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error fetching historical data' });
    }
});

app.get('/api/resistance/:symbol/:timeframe', async (req: Request, res: Response) => {
    let { symbol, timeframe } = req.params;
    symbol = symbol.replace('-', '/');
    const ohlcvs = await bot.fetchOHLCV(symbol, timeframe);
    const resistance = await bot.findTopResistance(ohlcvs);
    res.json({ resistance });
});

app.get('/api/symbols/leverage', async (req: Request, res: Response) => {
    try {
        const symbolsWithLeverage = await bot.getBybitPairsWithLeverage();
        res.json(symbolsWithLeverage);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error fetching symbols with leverage' });
    }
});

app.post('/api/rsi/bulk', async (req: Request, res: Response) => {
    const { symbols, timeframes } = req.body;
    if (!symbols || !timeframes) {
        return res.status(400).send({ error: 'Symbols and timeframes are required.' });
    }

    const rsiValues = {};

    for (let symbol of symbols) {
        rsiValues[symbol] = {};
        for (let timeframe of timeframes) {
            try {
                const symbolData = bot.dataStore.get(PAIR_TYPES.leveragePairs).get(symbol);  // Change PAIR_TYPES.cryptoPairs based on your needs
                if (symbolData && symbolData.rsi && symbolData.rsi.has(timeframe)) {
                    rsiValues[symbol][timeframe] = symbolData.rsi.get(timeframe);
                } else {
                    rsiValues[symbol][timeframe] = null;
                }
            } catch (error) {
                console.error(`Error fetching RSI from datastore for ${symbol} and ${timeframe}:`, error);
            }
        }
    }

    res.json(rsiValues);
});


// Tests 
app.get('/api/rsi/getValues', async (req: Request, res: Response) => {
    console.log("🚀 ~ file: backend-server.ts:170 ~ app.get ~ bot.dataStore:", bot.dataStore, dataConvertor)
    return res.json(dataConvertor.stringifyMap(bot.dataStore))
})

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



// app.address = 3000
// app.listen(app.address, () => {
//     // console.log('Server is running on http://localhost:3000');
//     bot.populateDataStore()
// });

console.log("🚀 ~ file: backend-server.ts:203 ~ app:", app)
export default app;
// module.exports = app;

