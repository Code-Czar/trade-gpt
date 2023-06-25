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

    async findSupport(ohlcvs: any[]) {
        let lowest = ohlcvs[0][3];
        for (let i = 1; i < ohlcvs.length; i++) {
            if (ohlcvs[i][3] < lowest) {
                lowest = ohlcvs[i][3];
            }
        }
        return lowest;
    }

    async findResistance(ohlcvs: any[]) {
        let highest = ohlcvs[0][2];
        for (let i = 1; i < ohlcvs.length; i++) {
            if (ohlcvs[i][2] > highest) {
                highest = ohlcvs[i][2];
            }
        }
        return highest;
    }


}
