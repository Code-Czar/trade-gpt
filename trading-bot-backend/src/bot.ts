import * as ccxt from 'ccxt';
import * as cliChart from 'cli-chart';
import { BollingerBands, MACD, RSI } from 'technicalindicators';



export class TradingBot {
    private exchange: ccxt.Exchange;

    constructor(exchangeId: string) {
        this.exchange = new (ccxt as any)[exchangeId]();
    }

    async fetchOHLCV(symbol: string, timeframe: string) {
        await this.exchange.loadMarkets();
        return this.exchange.fetchOHLCV(symbol, timeframe);
    }

    calculateBollingerBands(ohlcv: any[]) {
        const closeValues = ohlcv.map(x => x[4]);
        return BollingerBands.calculate({ period: 20, values: closeValues, stdDev: 2 });
    }

    calculateRSI(ohlcv: any[]) {
        const closeValues = ohlcv.map(x => x[4]);
        return RSI.calculate({ values: closeValues, period: 14 });
    }

    calculateMACD(ohlcv: any[]) {
        const closeValues = ohlcv.map(x => x[4]);
        return MACD.calculate({
            values: closeValues,
            fastPeriod: 12,
            slowPeriod: 26,
            signalPeriod: 9,
            SimpleMAOscillator: false,
            SimpleMASignal: false
        });
    }

    calculateVolumes(ohlcv: any[]) {
        return ohlcv.map(x => x[5]);
    }

    async findLowestSupport(ohlcvs: any[]) {
        let lowest = ohlcvs[0][3];
        for (let i = 1; i < ohlcvs.length; i++) {
            if (ohlcvs[i][3] < lowest) {
                lowest = ohlcvs[i][3];
            }
        }
        return [0, 0, 0, lowest];
    }

    async findSupport(ohlcvs, tolerance = 0.0001) {
        const supports = [];
        let potentialSupport = null;

        ohlcvs.forEach((ohlc, index) => {
            if (index === 0) return;

            const prevOhlc = ohlcvs[index - 1];

            // If we're not currently tracking a support level
            if (!potentialSupport) {
                // And the current price is lower than the previous one, start tracking a potential support level
                if (ohlc.low < prevOhlc.low) {
                    potentialSupport = {
                        level: ohlc.low,
                        hits: [],
                        start: prevOhlc.time,
                        end: null
                    };
                }
            } else {
                // If the current price is lower than the potential support level, update it
                if (ohlc.low < potentialSupport.level) {
                    potentialSupport.level = ohlc.low;
                    potentialSupport.end = ohlc.time;
                } else {
                    // If the price is within the tolerance of the potential support level, register a hit
                    if (ohlc.low <= potentialSupport.level * (1 + tolerance)) {
                        potentialSupport.hits.push(ohlc);
                    } else if (ohlc.low > potentialSupport.level * (1 + tolerance)) {
                        // If the price rises above the tolerance of the potential support level, finish tracking it
                        if (potentialSupport.hits.length > 1) {
                            supports.push(potentialSupport);
                        }
                        potentialSupport = null;
                    }
                }
            }
        });

        return supports;
    }
    async findTopResistance(ohlcvs: any[]) {
        let highest = ohlcvs[0][2];
        for (let i = 1; i < ohlcvs.length; i++) {
            if (ohlcvs[i][2] > highest) {
                highest = ohlcvs[i][2];
            }
        }
        return [0, 0, 0, highest];
    }

    async findResistance(ohlcvs, tolerance = 0.0001) {
        const resistances = [];
        let potentialResistance = null;

        ohlcvs.forEach((ohlc, index) => {
            if (index === 0) return;

            const prevOhlc = ohlcvs[index - 1];

            // If we're not currently tracking a resistance level
            if (!potentialResistance) {
                // And the current price is higher than the previous one, start tracking a potential resistance level
                if (ohlc.high > prevOhlc.high) {
                    potentialResistance = {
                        level: ohlc.high,
                        hits: [],
                        start: prevOhlc.time,
                        end: null
                    };
                }
            } else {
                // If the current price is higher than the potential resistance level, update it
                if (ohlc.high > potentialResistance.level) {
                    potentialResistance.level = ohlc.high;
                    potentialResistance.end = ohlc.time;
                } else {
                    // If the price is within the tolerance of the potential resistance level, register a hit
                    if (ohlc.high >= potentialResistance.level * (1 - tolerance)) {
                        potentialResistance.hits.push(ohlc);
                    } else if (ohlc.high < potentialResistance.level * (1 - tolerance)) {
                        // If the price drops below the tolerance of the potential resistance level, finish tracking it
                        if (potentialResistance.hits.length > 1) {
                            resistances.push(potentialResistance);
                        }
                        potentialResistance = null;
                    }
                }
            }
        });

        return resistances;
    }


}
