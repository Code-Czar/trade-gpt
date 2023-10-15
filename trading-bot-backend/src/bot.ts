
import { PAIR_TYPES, FOREX_PAIRS } from './types/consts'
import { cryptoFetcher, forexFetcher, byBitDataFetcher } from './dataFetchers';
import { convertBybitTimeFrameToLocal, sortDataAscending, convertTimeframeToMs } from './utils/convertData';
import indicators from './indicators';

const fs = require('fs');
const path = require('path');

const binanceDataFile = 'binanceData.json';
const bybitDataFile = 'bybitData.json';


export class TradingBot {
    public allSymbols = [];
    public dataStore = new Map();
    public refreshRate = 0;

    constructor(exchangeId: string) {
        this.dataStore.set(PAIR_TYPES.leveragePairs, new Map());
        this.dataStore.set(PAIR_TYPES.forexPairs, new Map());
        this.dataStore.set(PAIR_TYPES.cryptoPairs, new Map());

    }





    async populateDataStoreForPair(pairType: string, symbolData: BasicObject | string, timeframe: string) {
        const symbolDetails = symbolData.details;
        const symbolName = symbolDetails.name;
        try {
            let ohlcvs: OHLCV | number[] | null = null;
            if (pairType === PAIR_TYPES.leveragePairs) {
                ohlcvs = symbolData[timeframe].ohlcv;
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
            await this.updateIndicators(symbolName, timeframe, ohlcvs);

        } catch (error) {
            console.error(`Error populating data store for ${typeof symbolDetails === 'object' ? symbolDetails.name : symbolDetails} and ${timeframe}:`, error);
        }
    }


    async updateIndicators(symbolName: string, timeframe: string, ohlcvs: any[]) {
        const storePair = this.dataStore.get(PAIR_TYPES.leveragePairs).get(symbolName);
        const formattedData = await indicators.formatOHLCVForChartData(ohlcvs); // Assuming this method exists in your indicators module

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
            console.log("🚀 ~ file: bot.ts:122 ~ TradingBot ~ newOHLCVDataAvailable ~ storePair:", storePair, [...storePair.ohlcvs?.keys()], storePair.details.name, symbolName, timeframe);
        }

        dataValues.forEach((newItem) => {
            if (ohlcvs.length === 0 || newItem[0] >= ohlcvs[ohlcvs.length - 1][0] + timeframeMs) {
                // If ohlcvs is empty or new item is beyond the last candle, push it
                ohlcvs.push(newItem);
            } else if (newItem[0] >= ohlcvs[ohlcvs.length - 1][0]) {
                // If new item is within the last candle, replace it
                ohlcvs[ohlcvs.length - 1] = newItem;
            } else {
                // Handle the case where new data is not for the last candle (if needed)
            }
        });

        await this.updateIndicators(symbolName, timeframe, ohlcvs);

        // Optionally: Only store the last 200 values
        storePair.ohlcvs.set(timeframe, ohlcvs.slice(-200));
        console.log("🚀 ~ file: bot.ts:123 ~ TradingBot ~ newOHLCVDataAvailable ~ symbolName:", symbolName);
    };





    async populateDataStoreParallel(timeframes = [
        '1d',
        '1h',
        '5m',
        '1m'
    ]) {
        const leveragePairs = await cryptoFetcher.getBybitPairsWithLeverage();
        // Placeholder for forex and crypto pairs
        const forexPairs = [];
        const cryptoPairs = [];

        // Loop indefinitely to keep fetching data for all pairs
        const initialHOLCV = await byBitDataFetcher.getInitialOHLCVs(leveragePairs, timeframes, 200);
        console.log("🚀 ~ file: bot.ts:151 ~ TradingBot ~ initialHOLCV:", initialHOLCV)

        const populatePromises = []

        Object.entries(await initialHOLCV).forEach(([symbolName, timeframes]) => {
            Object.entries(timeframes).forEach(async ([timeframe, ohlcvData]) => {
                if (timeframe === "details") {
                    return;
                }
                console.log("🚀 ~ file: bot.ts:156 ~ TradingBot ~ Object.entries ~ timeframe:", symbolName, timeframe)
                populatePromises.push(() => this.populateDataStoreForPair(PAIR_TYPES.leveragePairs, initialHOLCV[symbolName], timeframe))
                // await this.populateDataStoreForPair(PAIR_TYPES.leveragePairs, initialHOLCV[symbolName], key)

            })
        });
        Promise.all(populatePromises.map(fn => fn())).then((result) => {

            console.log("🚀 ~ file: bot.ts:164 ~ TradingBot ~ Promise:", this.dataStore.get(PAIR_TYPES.leveragePairs).get('10000NFTUSDT'))
        });

        await byBitDataFetcher.registerToAllOHLCVDataUpdates(Object.keys(await initialHOLCV), timeframes, this.newOHLCVDataAvailable.bind(this));

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

