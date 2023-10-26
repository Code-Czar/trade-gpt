const axios = require('axios');
import { webSocketRegisterToAllOHLCVDataUpdates, webSocketRegisterToOHLCVDataForPair, webSocketSetOHLCVsUpdateCallback } from "./ByBitWebSocket";
import { convertTimeFrameToByBitStandard } from "../utils/convertData";

const bybitAPIEndpoint = 'https://api.bybit.com/v5/market/kline';


import ByBitWebSocket from "./ByBitWebSocket";

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
        global.logger.info("🚀 ~ file: cryptoFetcher.ts:27 ~ fetchByBitOHLCV ~ symbol:",
            {
                name: symbolDetails.name,
                timeframe,
                length: response.data?.length
            }
            //  response.data
        )
        if (response.data) {
            response.data = response.data.map((item) => {
                return [parseFloat(item[0]),
                parseFloat(item[1]),
                parseFloat(item[2]),
                parseFloat(item[3]),
                parseFloat(item[4]),
                parseFloat(item[5])]

            })
        }
        else {
            console.error("🚀 ~ file: cryptoFetcher.ts:27 ~ fetchByBitOHLCV ~ symbol:",
                {
                    name: symbolDetails.name,
                    timeframe,
                    length: response.data?.length
                }
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
    global.logger.info("🚀 ~ file: ByBitDataFetcher.ts:5 ~ getInitialOHLCVs ~ timeframe:", timeframes)
    const fetchPromises = symbols.flatMap(symbol =>
        timeframes.map(timeframe => () => getInitialOHLCV(symbol, timeframe))
    );
    global.logger.info("🚀 ~ file: ByBitDataFetcher.ts:65 ~ getInitialOHLCVs ~ fetchPromises:", fetchPromises.length)
    const result = {}

    const shouldRetry = []

    while (fetchPromises.length > 0) {
        const batch = fetchPromises.splice(0, 100); // Get the next batch of 10 promises (and remove them from allPromises)
        const batchResults = await Promise.all(batch.map(fn => fn())); // Execute current batch of promises in parallel
        batchResults.forEach((batchResult, index) => {
            const { symbolDetails, timeframe, data } = batchResult
            if (!data) {
                global.logger.info("🚀 ~ file: ByBitDataFetcher.ts:82 ~ batchResults.forEach ~ data:", { name: symbolDetails.name, timeframe, data })

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

    global.logger.info("🚀 ~ file: ByBitDataFetcher.ts:61 ~ getInitialOHLCVs ~ allResults:", { keys: Object.keys(result).length })
    return result;
};
const setUpdateOHLCVCallback = (callback) => {
    ByBitWebSocket.webSocketSetOHLCVsUpdateCallback(callback)
}

const setReconnectCallback = (callback) => {
    ByBitWebSocket.setReconnectCallback(callback)
}

const registerToAllOHLCVDataUpdates = async (symbolNames, timeframes, callback) => {
    ByBitWebSocket.webSocketRegisterToAllOHLCVDataUpdates(symbolNames, timeframes, callback)
};
const registerToOHLCVDataUpdates = async (symbolNames, timeframes, callback) => {
    await ByBitWebSocket.webSocketRegisterToOHLCVDataForPair(symbolNames, timeframes)
};



export default {
    getInitialOHLCV,
    registerToOHLCVDataUpdates,
    getInitialOHLCVs,
    registerToAllOHLCVDataUpdates,
    setUpdateOHLCVCallback,
    setReconnectCallback
}