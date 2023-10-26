import { PAIR_TYPES, FOREX_PAIRS } from './types/consts'
import { cryptoFetcher, forexFetcher, byBitDataFetcher } from './dataFetchers';
import { convertBybitTimeFrameToLocal, sortDataAscending, convertTimeframeToMs, getStartOfTimeframe } from './utils/convertData';
import { indicators, formatOHLCVForChartData, stringifyMap } from 'trading-shared';
import { convertPairToJSON } from './utils/convertData';
import { InfluxDBWrapper } from './database';
import ByBitDataFetcher from './dataFetchers/byBitDataFetcher';

const fs = require('fs');
const path = require('path');

// const dataStorePath = './dist/database/dataStore.json';
const dbWrapper = new InfluxDBWrapper();

// dbWrapper.dropDatabase();
// dbWrapper.initDB();


const binanceDataFile = 'binanceData.json';
const bybitDataFile = 'bybitData.json';

const ACTIVE_TIMEFRAMES = ['1d', '1h', '5m', '1m']

let once = true;

interface DataFetchers {
    bybitDataFetcher?: ByBitDataFetcher | null
}

export class TradingBot {
    public allSymbols = [];
    public dataStore = new Map();
    public refreshRate = 0;
    private webSocketStreamer: any;
    public isUpdating = false;
    public initialized = false;

    public dataFetchers: DataFetchers = {
        bybitDataFetcher: null
    };

    constructor(webSocketStreamer) {
        this.dataStore.set(PAIR_TYPES.leveragePairs, new Map());
        this.dataStore.set(PAIR_TYPES.forexPairs, new Map());
        this.dataStore.set(PAIR_TYPES.cryptoPairs, new Map());
        this.webSocketStreamer = webSocketStreamer;

        this.dataFetchers.bybitDataFetcher = new ByBitDataFetcher()
        this.dataFetchers.bybitDataFetcher.setReconnectCallback(this.populateDataStoreParallel.bind(this));
        this.dataFetchers.bybitDataFetcher.setUpdateOHLCVCallback(this.newOHLCVDataAvailable.bind(this));


    }

    async newOHLCVDataAvailable(eventData) {
        const symbolName = (await eventData).topic.split('.')[2];
        const timeframeStr = eventData.topic.split('.')[1];
        const timeframe = convertBybitTimeFrameToLocal(timeframeStr);
        const timeframeMs = convertTimeframeToMs(timeframe);

        const dataValues = (await eventData).data.map((item) => [
            parseFloat(item.timestamp),
            parseFloat(item.open),
            parseFloat(item.high),
            parseFloat(item.low),
            parseFloat(item.close),
            parseFloat(item.volume),
        ]);

        const leveragePairs = this.dataStore.get(PAIR_TYPES.leveragePairs);
        const storePair = leveragePairs.get(symbolName);
        const ohlcvs = storePair.ohlcvs.get(timeframe);

        if (!ohlcvs) {
        }

        dataValues.forEach((newItem) => {
            const lastCandleStartTime = getStartOfTimeframe(ohlcvs[ohlcvs.length - 1][0], timeframeMs);
            const newItemStartTime = getStartOfTimeframe(newItem[0], timeframeMs);

            // Diagnostic logs
            // global.logger.info(`Last candle timestamp: ${ohlcvs[ohlcvs.length - 1][0]}, Start Time: ${lastCandleStartTime}`);
            // global.logger.info(`New item timestamp: ${newItem[0]}, Start Time: ${newItemStartTime}`);

            if (lastCandleStartTime === newItemStartTime) {
                ohlcvs[ohlcvs.length - 1] = newItem;
            } else {
                ohlcvs.push(newItem);
            }
        });
        global.logger.debug("🚀 ~ file: bot.ts:90 ~ dataValues:", dataValues.length);


        await this.updateIndicators(symbolName, timeframe, ohlcvs.slice(-200));

        // Optionally: Only store the last 200 values
        storePair.ohlcvs.set(timeframe, ohlcvs.slice(-200));
        dbWrapper.pushNewDataToDB(storePair, dataValues.length)
        this.webSocketStreamer.broadcast(`getRealTimeData`, { storePair: await convertPairToJSON(leveragePairs.get(symbolName)) })
        // this.writePairToDatabase(storePair);
    };

    async updateIndicators(symbolName: string, timeframe: string, ohlcvs: any[]) {
        const storePair = this.dataStore.get(PAIR_TYPES.leveragePairs).get(symbolName);
        const formattedData = formatOHLCVForChartData(ohlcvs); // Assuming this method exists in your indicators module

        // Calculate and update RSI
        const { rsi, rsiData } = await indicators.calculateRSI(formattedData);
        storePair.rsi.set(timeframe, { rsi, rsiData });

        // Calculate and update Volumes
        storePair.volumes.set(timeframe, await indicators.calculateVolumes(formattedData));

        // Calculate and update SMA
        storePair.sma.set(timeframe, await indicators.calculateSMA(formattedData));

        // Calculate and update EMA
        const EMA7 = await indicators.calculateEMA(formattedData, 7);
        const EMA14 = await indicators.calculateEMA(formattedData, 14);
        const EMA28 = await indicators.calculateEMA(formattedData, 28);
        storePair.ema.set(timeframe, { ema7: EMA7.emaData, ema14: EMA14.emaData, ema28: EMA28.emaData });

        // Calculate and update MACD
        const { macdData, signalData, histogramData } = await indicators.calculateMACD(formattedData);
        storePair.macd.set(timeframe, { macdData, histogramData, signalData });

        // Calculate and update Bollinger Bands
        const { upperBand, lowerBand, middleBand } = await indicators.calculateBollingerBands(formattedData, 20);
        storePair.bollingerBands.set(timeframe, { upperBand, middleBand, lowerBand });
        return storePair;
    }


    async populateDataStoreForPair(pairType: string, symbolData: BasicObject | string, timeframe: string) {

        const symbolDetails = symbolData.details;
        const symbolName = symbolDetails.name;
        try {
            let ohlcvs: OHLCV | number[] | null = null;
            if (pairType === PAIR_TYPES.leveragePairs) {
                ohlcvs = symbolData[timeframe].ohlcv;
                if (!ohlcvs) {
                    console.error(`No ohlcvs data found for ${symbolName} and ${timeframe}`);
                    return;
                }
                ohlcvs = sortDataAscending(ohlcvs);
            } else {
                ohlcvs = await forexFetcher.fetchFOREXOHLC(symbolDetails as string, timeframe);
            }
            if (!ohlcvs) {
                return;
            }

            let storeSymbolPair = this.dataStore.get(pairType).get(symbolName);
            if (!storeSymbolPair) {
                this.dataStore.get(pairType).set(symbolName, {
                    ohlcvs: new Map(),
                    rsi: new Map(),
                    sma: new Map(),
                    ema: new Map(),
                    macd: new Map(),
                    volumes: new Map(),
                    bollingerBands: new Map(),
                    details: symbolDetails,
                });
                storeSymbolPair = this.dataStore.get(pairType).get(symbolName);
            }
            storeSymbolPair.ohlcvs.set(timeframe, ohlcvs);

            // Update the indicators using the factored out method
            storeSymbolPair = await this.updateIndicators(symbolName, timeframe, ohlcvs);
            return storeSymbolPair;
            // global.logger.debug("", await convertPairToJSON(storeSymbolPair), `${symbolName}.json`);

        } catch (error) {
            console.error(`Error populating data store for ${typeof symbolDetails === 'object' ? symbolDetails.name : symbolDetails} and ${timeframe}:`, error);
        }
    }

    async populateDataStoreParallel(timeframes = ACTIVE_TIMEFRAMES) {
        await dbWrapper.clearBucketData();

        if (this.isUpdating) {
            return
        }
        const dataFetcher = this.dataFetchers.bybitDataFetcher

        while (!dataFetcher?.isReady()) {
            await new Promise(resolve => setTimeout(resolve, 10));
        }


        this.isUpdating = true

        const leveragePairs = await cryptoFetcher.getBybitPairsWithLeverage();


        const fetchPromises = [];

        leveragePairs.forEach(symbol => {
            timeframes.forEach(timeframe => {
                fetchPromises.push(async () => {
                    const result = await dataFetcher.getInitialOHLCV(symbol, timeframe);
                    if (result && result.data) {
                        const inputData = {
                            details: result.symbolDetails,
                            [timeframe]: {
                                ohlcv: result.data
                            },
                        }
                        const storePair = this.populateDataStoreForPair(PAIR_TYPES.leveragePairs, inputData, timeframe);
                        this.writePairToDatabase(storePair)
                        // this.dataFetchers.bybitDataFetcher?.registerToOHLCVDataUpdates(symbol.name, timeframe);
                    }
                });
            });
        });

        while (fetchPromises.length > 0) {
            const batch = fetchPromises.splice(0, 2); // Get the next batch of 10 promises (and remove them from fetchPromises)
            await Promise.all(batch.map(fn => fn())); // Execute current batch of promises in parallel

            if (once) {
                // await this.writePairToDatabase(fetchPromises[0]?.details?.name, fetchPromises[0].data)
                once = false;
            }
            await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second before next batch
        }

        global.logger.info("Data store populated and subscriptions set up for all leverage pairs.");
        // await this.writePairsToDatabase()
        this.isUpdating = false;
        this.initialized = true;


    }
    // Inside TradingBot class

    private async fetchBatchHistoricalDataForPair(pairSymbol: string, timeframe: string, startTimestamp: number, endTimestamp: number, limit = 200) {
        // Get symbolDetails corresponding to pairSymbol
        const symbolDetails = this.dataStore.get(PAIR_TYPES.leveragePairs).get(pairSymbol).details;

        const fetchedData = await this.dataFetchers.bybitDataFetcher?.getInitialOHLCV(symbolDetails, timeframe, limit, startTimestamp, endTimestamp);  // Assuming a default limit of 200
        // console.log("🚀 ~ file: bot.ts:241 ~ fetchedData:", fetchedData);
        const newData = fetchedData?.data;

        if (!newData || newData.length === 0) {
            return false; // Exit if no more data
        }

        // Update in-memory data store
        const storePair = this.dataStore.get(PAIR_TYPES.leveragePairs).get(pairSymbol);
        // console.log("🚀 ~ file: bot.ts:249 ~ storePair:", storePair);
        storePair.ohlcvs.set(timeframe, [...storePair.ohlcvs.get(timeframe), ...newData]);

        // Update indicators and write to InfluxDB
        await this.updateIndicators(pairSymbol, timeframe, storePair.ohlcvs.get(timeframe));
        global.logger.info("🚀 ~ file: bot.ts:237 ~ TradingBot ~ fetchBatchHistoricalDataForPair ~ writePairToDatabase:", { name: pairSymbol })
        await this.writePairToDatabase(storePair);
        return true;
    }

    async fetchAllHistoricalData() {
        while (this.isUpdating || !this.initialized || !this.dataStore.get(PAIR_TYPES.leveragePairs)) {
            global.logger.info("Waiting for current data update to finish...");
            await new Promise(resolve => setTimeout(resolve, 1000));;
        }
        this.isUpdating = true;
        const fetchPromises: Array<Promise<any>> = [];

        const leveragePairs = this.dataStore.get(PAIR_TYPES.leveragePairs);
        for (const [pairName, pairData] of leveragePairs.entries()) {
            for (const timeframe of ACTIVE_TIMEFRAMES) {
                const earliestTimestamp = pairData.ohlcvs.get(timeframe)[0][0];
                const timeframeMs = convertTimeframeToMs(timeframe);
                let currentTimestamp = earliestTimestamp;
                const limit = 1000;

                while (true) { // continue until we've fetched all data
                    console.log("🚀 ~ file: bot.ts:277 ~ pairName:", pairName);
                    const hasData = await this.fetchBatchHistoricalDataForPair(pairName, timeframe, currentTimestamp - timeframeMs * limit, currentTimestamp, limit);

                    // Assuming data.length < limit means there's no more data left.
                    if (!hasData) {
                        break; // exit the while loop
                    }

                    currentTimestamp += timeframeMs * 1000;
                }
            }
        }
        while (fetchPromises.length > 0) {
            const batch = fetchPromises.splice(0, 100); // Get the next batch of 10 promises (and remove them from fetchPromises)
            await Promise.all(batch.map(fn => fn())); // Execute current batch of promises in parallel
            await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second before next batch
        }

        global.logger.info("All historical data fetched and data store updated.");
        this.isUpdating = false;
    }

    async writePairToDatabase(pairData) {
        global.logger.debug("🚀 ~ file: bot.ts:304 ~ writePairToDatabase:", pairData);
        await dbWrapper.writePairToDatabase(pairData);
    }

    async writePairsToDatabase() {
        const leveragePairs = this.dataStore.get(PAIR_TYPES.leveragePairs);
        leveragePairs.forEach(async (pairData, pairName) => {
            global.logger.debug("🚀 ~ file: bot.ts:316 ~ leveragePairs:", pairData);
            await dbWrapper.writePairToDatabase(pairData);
        })

    }


    calculateRSI(prices: number[] | null, period = 14): number | null {
        if (!prices) {
            return null
        }
        if (prices?.length && prices.length < period + 1) {
            throw new Error('Not enough data to compute RSI');
        }

        const deltas = prices.slice(1).map((price, i) => price - prices[i]);
        const gains = deltas.map((delta) => Math.max(delta, 0));
        const losses = deltas.map((delta) => Math.abs(Math.min(delta, 0))); // use abs to get positive loss values

        let avg_gain = gains.slice(0, period).reduce((a, b) => a + b) / period;
        let avg_loss = losses.slice(0, period).reduce((a, b) => a + b) / period;

        for (let idx = period; idx < prices.length - 1; idx++) {
            avg_gain = (avg_gain * (period - 1) + gains[idx]) / period;
            avg_loss = (avg_loss * (period - 1) + losses[idx]) / period;
        }

        if (avg_loss === 0) {
            return 100;
        }
        const rs = avg_gain / avg_loss;
        return 100 - 100 / (1 + rs);
    }
}

