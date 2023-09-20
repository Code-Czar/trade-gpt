const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const { PAIR_TYPES, TradingBot } = require('./src/bot');

const bot = new TradingBot('binance');

const symbol = 'BTC/USDT';
const timeframe = '1m'; // 1 day

const app = express();

app.use(bodyParser.json());


// Enable CORS
app.use(cors());

// Data store
let ohlcvData = null;

// Fetch new data every 1 minute
let count = 0;

app.get('/api/data/:symbol/:timeframe', async (req, res) => {
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

app.get('/bollinger-bands/:symbol/:timeframe', async (req, res) => {
    let { symbol, timeframe } = req.params;
    symbol = symbol.replace('-', '/');
    const ohlcv = await bot.fetchOHLCV(symbol, timeframe);
    const bollingerBands = bot.calculateBollingerBands(ohlcv);
    res.send(bollingerBands);
});

app.get('/rsi/:symbol/:timeframe', async (req, res) => {
    let { symbol, timeframe } = req.params;
    symbol = symbol.replace('-', '/');
    const ohlcv = await bot.fetchOHLCV(symbol, timeframe);
    const rsi = bot.calculateRSI(ohlcv);
    res.send(rsi);
});
// Setup POST route
app.post('/rsi', async (req, res) => {
    const { ohlcv } = req.body;

    // Ensure symbol and timeframe are provided
    if (!ohlcv) {
        return res.status(400).send({ error: 'OHLCV are required.' });
    }
    const rsi = bot.calculateRSI(ohlcv);
    res.send({ rsi });
});


app.get('/macd/:symbol/:timeframe', async (req, res) => {
    let { symbol, timeframe } = req.params;
    symbol = symbol.replace('-', '/');
    const ohlcv = await bot.fetchOHLCV(symbol, timeframe);
    const macd = bot.calculateMACD(ohlcv);
    res.send(macd);
});

app.get('/volumes/:symbol/:timeframe', async (req, res) => {
    let { symbol, timeframe } = req.params;
    symbol = symbol.replace('-', '/');
    const ohlcv = await bot.fetchOHLCV(symbol, timeframe);
    const volumes = bot.calculateVolumes(ohlcv);
    res.send(volumes);
});

app.get('/api/support/:symbol/:timeframe', async (req, res) => {
    let { symbol, timeframe } = req.params;
    symbol = symbol.replace('-', '/');
    const ohlcvs = await bot.fetchOHLCV(symbol, timeframe);
    const support = await bot.findLowestSupport(ohlcvs);
    res.json({ support });
});

app.get('/api/historical/:symbol/:timeframe/:limit', async (req, res) => {
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

app.get('/api/resistance/:symbol/:timeframe', async (req, res) => {
    let { symbol, timeframe } = req.params;
    symbol = symbol.replace('-', '/');
    const ohlcvs = await bot.fetchOHLCV(symbol, timeframe);
    const resistance = await bot.findTopResistance(ohlcvs);
    res.json({ resistance });
});

app.get('/api/symbols/leverage', async (req, res) => {
    try {
        const symbolsWithLeverage = await bot.getBybitPairsWithLeverage();
        res.json(symbolsWithLeverage);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error fetching symbols with leverage' });
    }
});

app.post('/api/rsi/bulk', async (req, res) => {
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


app.listen(3000, () => {
    // console.log('Server is running on http://localhost:3000');
    bot.populateDataStore()
});
