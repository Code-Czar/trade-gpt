const axios = require('axios');
import { webSocketRegisterToAllOHLCVDataUpdates } from "./ByBitWebSocket";
import { convertTimeFrameToByBitStandard } from "../utils/convertData";

const bybitAPIEndpoint = 'https://api.bybit.com/v5/market/mark-price-kline';




export const getInitialOHLCV = async (symbolDetails, timeframe, limit = 200, from = null, to = null) => {
    const requestParams = {
        category: 'linear',
        symbol: symbolDetails.name,
        interval: convertTimeFrameToByBitStandard(timeframe),  // e.g., '1m', '5m', '1h', etc.
        start: from,  // Timestamp in seconds for the start of the candlestick data
        end: to,  // Timestamp in seconds for the end of the candlestick data
        limit: limit,  // Timestamp in seconds for the end of the candlestick data
    }
    try {
        // Making HTTP GET request to Bybit API
        const response = await axios.get(bybitAPIEndpoint, {
            params: requestParams
        });

        // Logging the data
        response.data = response.data.result.list
        console.log("🚀 ~ file: cryptoFetcher.ts:27 ~ fetchByBitOHLCV ~ symbol:",
            symbolDetails.name,
            timeframe,
            response.data?.length
            //  response.data
        )
        if (response.data) {
            response.data = response.data.map((item) => {
                return {
                    timestamp: parseFloat(item[0]),
                    open: parseFloat(item[1]),
                    high: parseFloat(item[2]),
                    low: parseFloat(item[3]),
                    close: parseFloat(item[4]),
                    volume: parseFloat(item[5]),
                }
            })
        }
        else {
            console.error("🚀 ~ file: cryptoFetcher.ts:27 ~ fetchByBitOHLCV ~ symbol:",
                symbolDetails.name,
                response,
                requestParams, timeframe
                //  response.data
            )
        }


        // Returning the OHLCV data
        return { symbolDetails, timeframe, data: response.data };
    } catch (error) {
        // Handling any errors
        console.error('Error fetching OHLCV data:', error);
        return null;
    }

};

export const getInitialOHLCVs = async (symbols, timeframes, limit = 200, from = null, to = null) => {
    console.log("🚀 ~ file: ByBitDataFetcher.ts:5 ~ getInitialOHLCVs ~ timeframe:", timeframes)
    const fetchPromises = symbols.flatMap(symbol =>
        timeframes.map(timeframe => () => getInitialOHLCV(symbol, timeframe))
    );
    console.log("🚀 ~ file: ByBitDataFetcher.ts:65 ~ getInitialOHLCVs ~ fetchPromises:", fetchPromises.length)
    const result = {}

    const shouldRetry = []

    while (fetchPromises.length > 0) {
        const batch = fetchPromises.splice(0, 50); // Get the next batch of 10 promises (and remove them from allPromises)
        const batchResults = await Promise.all(batch.map(fn => fn())); // Execute current batch of promises in parallel
        batchResults.forEach((batchResult, index) => {
            const { symbolDetails, timeframe, data } = batchResult
            if (!data) {
                console.log("🚀 ~ file: ByBitDataFetcher.ts:82 ~ batchResults.forEach ~ data:", symbolDetails.name, timeframe, data)

            }
            if (data) {
                if (!result[symbolDetails.name]) {
                    result[symbolDetails.name] = {}
                }
                if (!result[symbolDetails.name][timeframe]) {
                    result[symbolDetails.name][timeframe] = {}
                }
                result[symbolDetails.name][timeframe].ohlcv = data
                result[symbolDetails.name].details = symbolDetails

            }
        })

        await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 10 seconds before next batch
    }

    console.log("🚀 ~ file: ByBitDataFetcher.ts:61 ~ getInitialOHLCVs ~ allResults:", Object.keys(result).length)
    return result;
};

const registerToAllOHLCVDataUpdates = async (symbolNames, timeframes, callback) => {
    webSocketRegisterToAllOHLCVDataUpdates(symbolNames, timeframes, callback)
};



export default {
    getInitialOHLCV,
    getInitialOHLCVs,
    registerToAllOHLCVDataUpdates
}