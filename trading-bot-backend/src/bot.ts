
import { PAIR_TYPES, FOREX_PAIRS } from './types/consts'
import { cryptoFetcher, forexFetcher, byBitDataFetcher } from './dataFetchers';
import { convertBybitTimeFrameToLocal } from './utils/convertData';
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

        const symbolDetails = symbolData.details
        const symbolName = symbolDetails.name;
        try {
            let ohlcvs: OHLCV | number[] | null = null;
            if (pairType === PAIR_TYPES.leveragePairs) {
                ohlcvs = symbolData[timeframe].ohlcv;

            } else {
                ohlcvs = await forexFetcher.fetchFOREXOHLC(symbolDetails as string, timeframe);
            }
            if (!ohlcvs) {
                return;
            }
            const formattedData = await indicators.formatOHLCVForChartData(ohlcvs);


            const { rsi, rsiData } = await indicators.calculateRSI(formattedData)

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
                    details: symbolDetails

                });
                storeSymbolPair = this.dataStore.get(pairType).get(symbolName);
            }

            if (storeSymbolPair.ohlcvs.has(timeframe)) {
                const existingOhlcvs = storeSymbolPair.ohlcvs.get(timeframe);
                const combinedOhlcvs = existingOhlcvs.concat(ohlcvs);
                storeSymbolPair.ohlcvs.set(timeframe, combinedOhlcvs.slice(-200)); // Only store the last 200 values
            } else {
                storeSymbolPair.ohlcvs.set(timeframe, ohlcvs);
            }

            if (storeSymbolPair.rsi.has(timeframe)) {
                const existingRsi = storeSymbolPair.rsi.get(timeframe);
                const combinedRsi = existingRsi.rsi.concat(rsi);
                const combinedRsiData = existingRsi.rsiData.concat(rsiData);
                storeSymbolPair.rsi.set(timeframe, { rsi: combinedRsi.slice(-200), rsiData: combinedRsiData.slice(-200) }); // Only store the last 200 values
            } else {
                storeSymbolPair.rsi.set(timeframe, { rsi, rsiData });
            }


            storeSymbolPair.volumes.set(timeframe, await indicators.calculateVolumes(formattedData))
            storeSymbolPair.sma.set(timeframe, await indicators.calculateSMA(formattedData))

            const EMA7 = await indicators.calculateEMA(formattedData, 7)
            const EMA14 = await indicators.calculateEMA(formattedData, 14)
            const EMA28 = await indicators.calculateEMA(formattedData, 28)
            storeSymbolPair.ema.set(timeframe, { ema7: EMA7.emaData, ema14: EMA14.emaData, ema28: EMA28.emaData })

            const { macdData, signalData, histogramData } = await indicators.calculateMACD(formattedData)
            storeSymbolPair.macd.set(timeframe, { macdData, histogramData, signalData })

            const { upperBand, lowerBand, middleBand } = await indicators.calculateBollingerBands(formattedData, 20)
            storeSymbolPair.bollingerBands.set(timeframe, { upperBand, middleBand, lowerBand })

            this.dataStore.get(pairType).set(symbolName, storeSymbolPair);
            // console.log("🚀 ~ file: bot.ts:100 ~ TradingBot ~ populateDataStoreForPair ~ this.dataStore:", this.dataStore)
            // this.dataStore.get(pairType).get(symbolName);
            // const result = this.dataStore.get(pairType).get(symbolName)
        } catch (error) {
            console.error(`Error populating data store for ${typeof symbolDetails === 'object' ? symbolDetails.name : symbolDetails} and ${timeframe}:`, error);
        }

    }
    async newOHLCVDataAvailable(eventData) {
        // console.log("🚀 ~ file: bot.ts:108 ~ TradingBot ~ newOHLCVDataAvailable ~ eventData:", eventData)
        const symbolName = (await eventData).topic.split('.')[2]
        const timeframe = convertBybitTimeFrameToLocal(eventData.topic.split('.')[1])
        const dataValues = (await eventData).data.map((item) => {
            return {
                timestamp: parseFloat(item.timestamp),
                open: parseFloat(item.open),
                high: parseFloat(item.high),
                low: parseFloat(item.low),
                close: parseFloat(item.close),
                volume: parseFloat(item.volume),
            }
        })
        const leveragePairs = this.dataStore.get(PAIR_TYPES.leveragePairs)
        const storePair = this.dataStore.get(PAIR_TYPES.leveragePairs).get(symbolName)
        const ohlcvs = storePair.ohlcvs.get(timeframe)
        if (!ohlcvs) {
            console.log("🚀 ~ file: bot.ts:122 ~ TradingBot ~ newOHLCVDataAvailable ~ storePair:", storePair, [...storePair.ohlcvs?.keys()], storePair.details.name, symbolName, timeframe)
        }
        dataValues.forEach((item) => {
            ohlcvs.push(item)
        }
        );
        storePair.ohlcvs.set(timeframe, ohlcvs.slice(-200)); // Only store the last 200 values
        console.log("🚀 ~ file: bot.ts:123 ~ TradingBot ~ newOHLCVDataAvailable ~ symbolName:", symbolName)
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

