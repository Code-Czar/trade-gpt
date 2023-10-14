
import { PAIR_TYPES, FOREX_PAIRS } from './types/consts'
import { cryptoFetcher, forexFetcher } from './dataFetchers';
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


        const filePath = path.resolve(__dirname, 'existingPairs.txt');

        if (!fs.existsSync(filePath) || !fs.readFileSync(filePath, 'utf8').trim().split('\n').length) {
            forexFetcher.checkFOREXPairsExistence()
                .then((existingPairs) => {
                    fs.writeFileSync(filePath, existingPairs.join('\n'));
                    console.log('Existing pairs have been saved!');
                })
                .catch((error) => {
                    console.error('Error checking pairs:', error);
                });
        }
    }

    async fetchOHLCV(symbol: string, timeframe: string) {
        const formattedSymbol = symbol.replace('/', '-');
        const isForex = FOREX_PAIRS.includes(formattedSymbol);
        if (isForex) {
            return await forexFetcher.fetchFOREXOHLC(formattedSymbol.replace('-', ''), timeframe);
        } else {
            return await cryptoFetcher.fetchCryptoOHLCV(symbol, timeframe);
        }
    }



    async populateDataStoreForPair(pairType: string, symbol: BasicObject | string, timeframe: string) {
        try {
            let ohlcvs: OHLCV | number[] | null = null;
            if (pairType === PAIR_TYPES.leveragePairs) {
                const symbolName = (symbol as BasicObject).name;

                try {
                    ohlcvs = await cryptoFetcher.getBinanceHistoricalData(symbolName, timeframe);
                    console.log("using BINANCE for:", symbolName);

                    if (ohlcvs) {
                        // const filePath = path.resolve(__dirname, binanceDataFile);
                        // fs.writeFileSync(filePath, JSON.stringify(ohlcvs));
                        // console.log("Data written to:", filePath);
                    } else {
                        try {

                            ohlcvs = await cryptoFetcher.fetchByBitOHLCV(symbolName, timeframe);
                            console.log("using BYBIT for : ", symbolName);
                        } catch (error) {
                            console.error(error)
                        }

                        if (ohlcvs) {
                            // const filePath = path.resolve(__dirname, bybitDataFile);
                            // fs.writeFileSync(filePath, JSON.stringify(ohlcvs));
                            // console.log("Data written to:", filePath);
                        }
                    }
                } catch (error) {
                    console.error("Error fetching/writing data:", error);
                }
            } else {
                ohlcvs = await forexFetcher.fetchFOREXOHLC(symbol as string, timeframe);
            }
            if (!ohlcvs) {
                return;
            }
            const formattedData = await indicators.formatOHLCVForChartData(ohlcvs);


            const { rsi, rsiData } = await indicators.calculateRSI(formattedData)

            let symbolData = this.dataStore.get(pairType).get(symbol);

            if (!symbolData) {
                this.dataStore.get(pairType).set(symbol, {
                    ohlcvs: new Map(),
                    rsi: new Map(),
                    sma: new Map(),
                    ema: new Map(),
                    macd: new Map(),
                    volumes: new Map(),
                    bollingerBands: new Map(),

                });
                symbolData = this.dataStore.get(pairType).get(symbol);
            }

            if (symbolData.ohlcvs.has(timeframe)) {
                const existingOhlcvs = symbolData.ohlcvs.get(timeframe);
                const combinedOhlcvs = existingOhlcvs.concat(ohlcvs);
                symbolData.ohlcvs.set(timeframe, combinedOhlcvs.slice(-200)); // Only store the last 200 values
            } else {
                symbolData.ohlcvs.set(timeframe, ohlcvs);
            }

            if (symbolData.rsi.has(timeframe)) {
                const existingRsi = symbolData.rsi.get(timeframe);
                const combinedRsi = existingRsi.rsi.concat(rsi);
                const combinedRsiData = existingRsi.rsiData.concat(rsiData);
                symbolData.rsi.set(timeframe, { rsi: combinedRsi.slice(-200), rsiData: combinedRsiData.slice(-200) }); // Only store the last 200 values
            } else {
                symbolData.rsi.set(timeframe, { rsi, rsiData });
            }


            symbolData.volumes.set(timeframe, await indicators.calculateVolumes(formattedData))
            symbolData.sma.set(timeframe, await indicators.calculateSMA(formattedData))

            const EMA7 = await indicators.calculateEMA(formattedData, 7)
            const EMA14 = await indicators.calculateEMA(formattedData, 14)
            const EMA28 = await indicators.calculateEMA(formattedData, 28)
            symbolData.ema.set(timeframe, { ema7: EMA7.emaData, ema14: EMA14.emaData, ema28: EMA28.emaData })

            const { macdData, signalData, histogramData } = await indicators.calculateMACD(formattedData)
            symbolData.macd.set(timeframe, { macdData, histogramData, signalData })

            const { upperBand, lowerBand, middleBand } = await indicators.calculateBollingerBands(formattedData, 20)
            symbolData.bollingerBands.set(timeframe, { upperBand, middleBand, lowerBand })


            if (typeof symbol === 'object') {

                this.dataStore.get(pairType).set(symbol.name, symbolData);
            } else {
                this.dataStore.get(pairType).set(symbol, symbolData);

            }
        } catch (error) {
            console.error(`Error populating data store for ${typeof symbol === 'object' ? symbol.name : symbol} and ${timeframe}:`, error);
        }
    }

    async populateDataStore(timeframes = ['1d', '1h', '5m']) {
        const leveragePairs = await cryptoFetcher.getBybitPairsWithLeverage();
        // Placeholder for forex and crypto pairs
        const forexPairs: Array<string> = [];
        const cryptoPairs: Array<string> = [];

        // Loop indefinitely to keep fetching data for all pairs
        while (true) {
            const startTime = new Date().getTime();
            for (const pair of leveragePairs) {
                for (const timeframe of timeframes) {
                    await this.populateDataStoreForPair(PAIR_TYPES.leveragePairs, pair, timeframe);
                }
            }
            for (const pair of forexPairs) {
                for (const timeframe of timeframes) {
                    await this.populateDataStoreForPair(PAIR_TYPES.forexPairs, pair, timeframe);
                }
            }

            for (const pair of cryptoPairs) {
                for (const timeframe of timeframes) {
                    await this.populateDataStoreForPair(PAIR_TYPES.cryptoPairs, pair, timeframe);
                }
            }

            const endTime = new Date().getTime();  // Store end time of the iteration
            this.refreshRate = endTime - startTime; // Calculate the time taken to fetch data for all pairs
            console.log("🚀 ~ file: bot.ts:177 ~ TradingBot ~ populateDataStore ~  this.refreshRate:", this.refreshRate)
        }
    }
    async populateDataStoreParallel(timeframes = ['1d', '1h', '5m', '1m']) {
        const leveragePairs = await cryptoFetcher.getBybitPairsWithLeverage();
        // Placeholder for forex and crypto pairs
        const forexPairs = [];
        const cryptoPairs = [];

        // Loop indefinitely to keep fetching data for all pairs
        while (true) {
            const startTime = new Date().getTime();

            const createPromises = (pairs, pairType) => pairs.flatMap(pair =>
                timeframes.map(timeframe =>
                    this.populateDataStoreForPair(pairType, pair, timeframe)
                )
            );

            const leveragePromises = createPromises(leveragePairs, PAIR_TYPES.leveragePairs);
            const forexPromises = createPromises(forexPairs, PAIR_TYPES.forexPairs);
            const cryptoPromises = createPromises(cryptoPairs, PAIR_TYPES.cryptoPairs);

            // Combine all promises into one array
            const allPromises = [
                ...leveragePromises,
                // ...forexPromises,
                // ...cryptoPromises,
            ];

            // Execute promises in batches of 100, waiting 2 seconds between each batch
            while (allPromises.length > 0) {
                const batch = allPromises.splice(0, 100); // Get the next batch of 100 promises (and remove them from allPromises)
                await Promise.all(batch); // Execute current batch of promises in parallel
                await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 2 seconds before next batch
            }

            const endTime = new Date().getTime();  // Store end time of the iteration
            this.refreshRate = endTime - startTime; // Calculate the time taken to fetch data for all pairs
            console.log("🚀 ~ file: bot.ts:177 ~ TradingBot ~ populateDataStore ~  this.refreshRate:", this.refreshRate);
        }
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

