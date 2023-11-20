import ByBitWebSocket from "./ByBitWebSocket";
import { convertTimeFrameToByBitStandard } from "../utils/convertData";

const axios = require('axios');
const bybitAPIEndpoint = 'https://api.bybit.com/v5/market/kline';

export class ByBitDataFetcher {

    public fetcherStatus = {
        isPublicSocketReady: false,
        isPrivateSocketReady: false,
        isFetcherReady: false
    }
    private callbacks = {
        onPublicClientReady: this.onPublicSocketReadyCallback.bind(this),
        onPrivateClientReady: this.onPublicSocketReadyCallback.bind(this)
    }
    private bybitWebSocket;


    constructor() {

        global.logger.debug("🚀 ~ file: byBitDataFetcher.ts:24 ~ ByBitWebSocket:", ByBitWebSocket);
        this.bybitWebSocket = new ByBitWebSocket(this.callbacks);
    }




    public async getInitialOHLCV(symbolDetails: SymbolDetails, timeframe: string, limit: number = 200, from?: number, to?: number): Promise<{ symbolDetails: SymbolDetails, timeframe: string, data: OHLCVData[] | null }> {
        const requestParams = {
            category: 'linear',
            symbol: symbolDetails.name,
            interval: convertTimeFrameToByBitStandard(timeframe),  // e.g., '1m', '5m', '1h', etc.
            start: from,  // Timestamp in ms for the start of the candlestick data
            end: to,  // Timestamp in ms for the end of the candlestick data
            limit: limit,  // Timestamp in seconds for the end of the candlestick data
        }
        try {
            // Making HTTP GET request to Bybit API
            const response = await axios.get(bybitAPIEndpoint, {
                params: requestParams
            });

            // Logging the data
            response.data = response.data.result.list
            /*global.logger.info("🚀 ~ file: cryptoFetcher.ts:27 ~ fetchByBitOHLCV ~ symbol:",
                {
                    name: symbolDetails.name,
                    timeframe,
                    length: response.data?.length
                }
                //  response.data
            )*/
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
    }

    public async getInitialOHLCVs(symbols: SymbolDetails[], timeframes: string[], limit: number = 200, from?: number, to?: number): Promise<Record<string, any>> {
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
    }

    public setUpdateOHLCVCallback(callback: (...args: any[]) => void): void {
        this.bybitWebSocket.webSocketSetOHLCVsUpdateCallback(callback);
    }

    public setReconnectCallback(callback: (...args: any[]) => void): void {
        this.bybitWebSocket.setReconnectCallback(callback);
    }

    public async registerToAllOHLCVDataUpdates(symbolNames: string[], timeframes: string[], callback: (...args: any[]) => void): Promise<void> {
        this.bybitWebSocket.webSocketRegisterToAllOHLCVDataUpdates(symbolNames, timeframes, callback);
    }

    public async registerToOHLCVDataUpdates(symbolName: string, timeframe: string): Promise<void> {
        this.bybitWebSocket.webSocketRegisterToOHLCVDataForPair(symbolName, timeframe);
    }

    public onPublicSocketReadyCallback(socketStatus: boolean) {
        this.fetcherStatus.isPublicSocketReady = socketStatus;
        this.fetcherStatus.isFetcherReady = this.fetcherStatus.isPublicSocketReady;
    }
    public onPrivateSocketReadyCallback(socketStatus: boolean) {
        this.fetcherStatus.isPrivateSocketReady = socketStatus;

    }

    public isReady() { return this.fetcherStatus.isFetcherReady }
}

export default ByBitDataFetcher;
