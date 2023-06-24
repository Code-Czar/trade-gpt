const express = require('express');
const cors = require('cors');
const { TradingBot } = require('./src/bot');



// import { TradingBot } from './bot';

const bot = new TradingBot('binance');

const symbol = 'BTC/USDT';
const timeframe = '1m'; // 1 day

const app = express();

// Enable CORS
app.use(cors());

// Data store
let ohlcvData = null;

// Fetch new data every 1 minute
let count = 0;
setInterval(async () => {
    try {
        const ohlcv = await bot.fetchOHLCV(symbol, timeframe);
        console.log("🚀 ~ file: server.ts:19 ~ setInterval ~ ohlcv:", ohlcv)
        ohlcvData = ohlcv;
        count++;
        console.log(`Fetched ${count} data`);
    } catch (error) {
        console.error(error);
    }
}, 1 * 1000);  // 1 seconds

app.get('/api/data', (req, res) => {
    res.json(ohlcvData);
});

app.listen(3000, () => {
    console.log('Server is running on http://localhost:3000');
});
