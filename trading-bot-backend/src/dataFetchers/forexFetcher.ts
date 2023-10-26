import { FOREX_PAIRS } from "../types";
import fetch from "node-fetch";

const fs = require('fs');


const FOREX_API_KEY = 'IUQ1W2DHSATKLZY9';



const FOREX_API_KEYS = [
    '289YKE5QXT6WYTMU',
    'BEB6S2C4NGEOXRCA',
    'SCZH4OGNM52B2X5P',
    'ZP3O6MM02ZZUHJG2',
    'ES2AURLO7XEFUHGC',
    'MUGYSNS1C5QEDUZX',
];
let currentKeyIndex = 0;
export const fetchWithRotatingApiKey = async (url: string) => {
    let response;
    let attempts = 0;

    while (attempts < FOREX_API_KEYS.length) {
        try {
            const apiKey = FOREX_API_KEYS[currentKeyIndex];
            response = await fetch(`${url}&apikey=${apiKey}`);

            // If you're using a library like Axios, you might get a status code
            // directly. With fetch, you'll have to check response.ok or response.status.
            if (response.ok) {
                return await response.json();
            } else if (response.status === 429) {
                // 429 is the typical "Too Many Requests" HTTP status code
                // Rotate to the next key for the next attempt
                currentKeyIndex = (currentKeyIndex + 1) % FOREX_API_KEYS.length;
                attempts++;
            } else {
                throw new Error(`Request failed with status ${response.status}`);
            }
        } catch (error) {
            console.error('Failed to fetch with current API key. Trying the next one.', error);
            currentKeyIndex = (currentKeyIndex + 1) % FOREX_API_KEYS.length;
            attempts++;
        }
    }

    throw new Error('All API keys have reached their rate limits.');
}

export const fetchFOREXOHLC = async (symbol: string, timeframe: string) => {
    const BASE_URL = `https://www.alphavantage.co/query?function=TIME_SERIES_INTRADAY&symbol=${symbol}&interval=${timeframe}&apikey=${FOREX_API_KEY}`;

    // const response = await fetch(BASE_URL);
    const data = await fetchWithRotatingApiKey(BASE_URL);
    // const data = await response.json();
    global.logger.info('🚀 ~ file: bot.ts:75 ~ TradingBot ~ fetchFOREXOHLC ~ data:', data);

    let formattedOHLCData: OHLCV = [];

    // Filter for the key that starts with 'Time Series'
    const timeSeriesKey = Object.keys(data).find((key) => key.startsWith('Time Series'));
    if (!timeSeriesKey) {
        console.error('Failed to find the Time Series key in the response.');
        return null;
    }

    const timeSeries = data[timeSeriesKey];

    for (let date in timeSeries) {
        const ohlc = timeSeries[date];
        const timestamp = new Date(date).getTime();
        formattedOHLCData.push([
            timestamp,
            parseFloat(ohlc['1. open']),
            parseFloat(ohlc['2. high']),
            parseFloat(ohlc['3. low']),
            parseFloat(ohlc['4. close']),
            parseFloat(ohlc['5. volume'] || '0'), // Assuming default volume of 0 if not provided
        ]);
    }
    fs.writeFileSync('forexdata.json', JSON.stringify(formattedOHLCData));
    return formattedOHLCData;
}



export const checkFOREXPairsExistence = async () => {
    const existingPairs: Array<string> = [];

    for (const pair of FOREX_PAIRS) {
        const response = await fetch(
            `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY_ADJUSTED&symbol=${pair}&apikey=${FOREX_API_KEY}`,
        );
        const data = await response.json();

        if (!data['Error Message'] && !data['Note']) {
            existingPairs.push(pair);
        }
    }

    return existingPairs;
}
export const fetchSymbolsForCurrency = async (currency: string) => {
    const BASE_URL = `https://www.alphavantage.co/query?function=SYMBOL_SEARCH&keywords=${currency}&apikey=${FOREX_API_KEY}`;

    const response = await fetch(BASE_URL);
    const data = await response.json();

    const symbols: Array<string> = [];
    if (data && data.bestMatches) {
        data.bestMatches.forEach((match) => {
            symbols.push(match['1. symbol']);
        });
    } else {
        console.error(`Failed to fetch symbols for ${currency}`);
    }

    return symbols;
}




export default {
    fetchFOREXOHLC,
    fetchWithRotatingApiKey,
    checkFOREXPairsExistence,
    fetchSymbolsForCurrency
}