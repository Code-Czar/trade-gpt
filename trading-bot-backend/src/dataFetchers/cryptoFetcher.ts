import * as ccxt from 'ccxt';
const axios = require('axios');

const exchangeId = 'binance';
const exchange: ccxt.Exchange = new (ccxt as any)[exchangeId]();
export const getBybitPairsWithLeverage = async () => {
    const url = 'https://api.bybit.com/v2/public/symbols';
    const response = await axios.get(url);
    const data = response.data;

    const pairs_with_leverage: BasicObject[] = [];

    if (data && data.result) {
        for (const item of data.result as Array<BasicObject>) {
            if (item.leverage_filter && item.leverage_filter.max_leverage) {
                pairs_with_leverage.push(item);
            }
        }
    }

    return pairs_with_leverage;
};

export const getBinanceHistoricalData = async (pair, interval, limit = 200) => {
    try {
        const url = `https://api.binance.com/api/v3/klines?symbol=${pair}&interval=${interval}&limit=${limit}`;
        const response = await axios.get(url);
        const data = response.data;

        // const closing_prices = data.map((item) => parseFloat(item[4]));
        return data;
    } catch (error) {
        console.log("🚀 ~ file: bot.ts:327 ~ TradingBot ~ getBinanceHistoricalData ~ error:", pair, error?.data?.msg)

    }
}
export const fetchCryptoOHLCV = async (symbol: string, timeframe: string) => {
    while (true) {
        try {
            await exchange.loadMarkets();
            return exchange.fetchOHLCV(symbol, timeframe);
        } catch (error) {
            if (error instanceof ccxt.DDoSProtection) {
                // console.log('Rate limit hit, waiting before retrying...');
                await new Promise((resolve) => setTimeout(resolve, 1000)); // wait for 1 second
            } else {
                throw error; // re-throw the error if it's not a rate limit error
            }
        }
    }
}

export default {
    getBybitPairsWithLeverage,
    getBinanceHistoricalData,
    fetchCryptoOHLCV
}