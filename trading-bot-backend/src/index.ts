

import { TradingBot } from './bot';

const bot = new TradingBot('binance');
const symbol = 'BTC/USDT';
const timeframe = '1d'; // 1 day

async function startBot() {
    // const data = await bot.fetchOHLCV(symbol, timeframe);
    // console.log(data);
}

startBot().catch(console.error);
