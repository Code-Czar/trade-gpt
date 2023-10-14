import * as ccxt from 'ccxt';
const axios = require('axios');

const exchangeId = 'binance';
const exchange: ccxt.Exchange = new (ccxt as any)[exchangeId]();
const bybitAPIEndpoint = 'https://api.bybit.com/v5/market/mark-price-kline';

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

const convertTimeFrameToByBitStandard = (interval: string) => {
    if (interval.includes('m')) {
        return interval.replace('m', '')
    }
    if (interval.includes('d')) {
        return 'D'
    }
    if (interval.includes('M')) {
        return 'M'
    }
    if (interval.includes('W')) {
        return 'W'
    }

};

export const fetchByBitOHLCV = async (symbol, interval, limit = 1000, from = null, to = null) => {
    try {
        // Making HTTP GET request to Bybit API
        const response = await axios.get(bybitAPIEndpoint, {
            params: {
                category: 'linear',
                symbol: symbol,
                interval: convertTimeFrameToByBitStandard(interval),  // e.g., '1m', '5m', '1h', etc.
                start: from,  // Timestamp in seconds for the start of the candlestick data
                end: to,  // Timestamp in seconds for the end of the candlestick data
                limit: limit,  // Timestamp in seconds for the end of the candlestick data
            }
        });

        // Logging the data
        response.data = response.data.result.list
        // console.log("🚀 ~ file: cryptoFetcher.ts:27 ~ fetchByBitOHLCV ~ symbol:", symbol, interval, response.data)
        // Returning the OHLCV data
        return response.data;
    } catch (error) {
        // Handling any errors
        console.error('Error fetching OHLCV data:', error);
        return null;
    }
}

export const getBinanceHistoricalData = async (pair, interval, limit = 1000) => {
    try {
        const url = `https://api.binance.com/api/v3/klines?symbol=${pair}&interval=${interval}&limit=${limit}`;
        const response = await axios.get(url);
        const data = response.data;

        // const closing_prices = data.map((item) => parseFloat(item[4]));
        return data;
    } catch (error) {
        console.error("🚀 ~ file: bot.ts:327 ~ TradingBot ~ getBinanceHistoricalData ~ error:", pair, error.response.data.msg)

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
    fetchCryptoOHLCV,
    fetchByBitOHLCV
}