import { sendNotification } from './notifiers';
import { formatOHLCVForChartData, computeEMASignals, unixTimestampToDate } from 'trading-shared';

const LOWER_RSI_THRESHOLD = 30;
export class StrategyAnalyzer {
    public notificationsSent = {};
    public pastRSISignals = {};
    public pastEMA28Signals = {};

    constructor() { }

    public async analyzeEMAPastData(realTimeData) {
        const { storePair } = realTimeData;
        const symbolName = storePair.details.name;
        const { ema, ohlcvs } = storePair;
        const timeframes = Object.keys(ema);
        timeframes.forEach((timeframe) => {
            const formattedData = formatOHLCVForChartData(ohlcvs[timeframe]);
            const ema28 = ema[timeframe].ema28;
            const emaSignal = computeEMASignals(formattedData, ema28, 28);

            if (!this.pastEMA28Signals[symbolName]) {
                this.pastEMA28Signals[symbolName] = {};
            }
            if (!this.pastEMA28Signals[symbolName][timeframe]) {
                this.pastEMA28Signals[symbolName][timeframe] = {};
            }
            this.pastEMA28Signals[symbolName][timeframe]['ema28signals'] = emaSignal;
        });
    }

    public async analyzeRSIPastData(realTimeData) {
        const { storePair } = realTimeData;
        const symbolName = storePair.details.name;
        const { rsi } = storePair;
        const timeframes = Object.keys(rsi);

        if (!this.notificationsSent[symbolName]) {
            this.notificationsSent[symbolName] = {};
        }

        timeframes.forEach((timeframe) => {
            const rsiTimeframe = rsi[timeframe].rsiData;

            rsiTimeframe.forEach((rsiData) => {
                if (rsiData.value <= LOWER_RSI_THRESHOLD) {
                    if (!this.pastRSISignals[symbolName]) {
                        this.pastRSISignals[symbolName] = {};
                    }
                    if (!this.pastRSISignals[symbolName][timeframe]) {
                        this.pastRSISignals[symbolName][timeframe] = {};
                    }
                    this.pastRSISignals[symbolName][timeframe][rsiData.time] = rsiData.value;
                }
            });
        });
    }
    public async analyzeRSIRealTime(realTimeData) {
        const { storePair } = realTimeData;
        const symbolName = storePair.details.name;
        const { rsi } = storePair;
        const timeframes = Object.keys(rsi);

        if (!this.notificationsSent[symbolName]) {
            this.notificationsSent[symbolName] = {};
        }

        timeframes.forEach((timeframe) => {
            const rsiTimeframe = rsi[timeframe].rsiData;
            const lastRSIValue = rsiTimeframe[rsiTimeframe.length - 1]?.value;
            const lastRSITime = unixTimestampToDate(rsiTimeframe[rsiTimeframe.length - 1]?.time);
            if (!lastRSIValue) {
                return;
            }

            if (lastRSIValue <= LOWER_RSI_THRESHOLD && !this.notificationsSent[symbolName][timeframe]) {
                sendNotification(`RSI for ${symbolName} on ${timeframe} is ${lastRSIValue.toFixed(3)} at ${lastRSITime} `);

                this.notificationsSent[symbolName][timeframe] = true;
            }
            if (lastRSIValue >= LOWER_RSI_THRESHOLD && this.notificationsSent[symbolName][timeframe]) {
                this.notificationsSent[symbolName][timeframe] = false;
            }
        });
    }
}
