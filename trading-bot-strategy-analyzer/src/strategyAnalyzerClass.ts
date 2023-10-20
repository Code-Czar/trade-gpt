import { sendNotification } from "./notifiers";


const LOWER_RSI_THRESHOLD = 30;
export class StrategyAnalyzer {
    public notificationsSent = {};
    public pastRSISignals = {};

    constructor() {
    }

    public async analyzeRSIPastData(realTimeData) {
        const { storePair } = realTimeData;
        const symbolName = storePair.details.name
        const { rsi } = storePair;
        const timeframes = Object.keys(rsi);

        if (!this.notificationsSent[symbolName]) {
            this.notificationsSent[symbolName] = {};
        }

        timeframes.forEach((timeframe) => {
            const rsiTimeframe = rsi[timeframe].rsiData

            rsiTimeframe.forEach((rsiData) => {
                if (rsiData.value <= LOWER_RSI_THRESHOLD) {
                    if (!this.pastRSISignals[symbolName]) {
                        this.pastRSISignals[symbolName] = {}
                    }
                    if (!this.pastRSISignals[symbolName][timeframe]) {
                        this.pastRSISignals[symbolName][timeframe] = {}
                    }
                    this.pastRSISignals[symbolName][timeframe][rsiData.time] = rsiData.value
                }

            })
        });
    }
    public async analyzeRSIRealTime(realTimeData) {
        const { storePair } = realTimeData;
        const symbolName = storePair.details.name
        const { rsi } = storePair;
        const timeframes = Object.keys(rsi);

        if (!this.notificationsSent[symbolName]) {
            this.notificationsSent[symbolName] = {};
        }

        timeframes.forEach((timeframe) => {
            const rsiTimeframe = rsi[timeframe].rsiData
            const lastRSIValue = rsiTimeframe[rsiTimeframe.length - 1]?.value;
            if (!lastRSIValue) {
                return;
            }

            if (lastRSIValue <= LOWER_RSI_THRESHOLD && !this.notificationsSent[symbolName][timeframe]) {
                sendNotification(`RSI for ${symbolName} on ${timeframe} is ${lastRSIValue}`)

                this.notificationsSent[symbolName][timeframe] = true;
            }
            if (lastRSIValue >= LOWER_RSI_THRESHOLD && this.notificationsSent[symbolName][timeframe]) {
                this.notificationsSent[symbolName][timeframe] = false;
            }
        });
    }

}