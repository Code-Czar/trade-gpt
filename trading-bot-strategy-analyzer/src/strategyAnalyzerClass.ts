import { sendNotification } from './notifiers';
import { apiConnector, CENTRALIZATION_API_URLS, convertPairToJSON } from "trading-shared"
import { formatOHLCVForChartData, computeEMASignals, unixTimestampToDate } from 'trading-shared';
import fetch from 'node-fetch'

const fs = require('fs');


const LOWER_RSI_THRESHOLD = 50;
export class StrategyAnalyzer {
    public notificationsSent = {};
    public pastRSISignals = {};
    public pastEMA28Signals = {};
    private usersNotifications = {};

    constructor() { }

    public init() {
        this.getUsersNotifications()
    }

    private async getUsersNotifications() {
        let aggregatedUserNotifications = {};

        console.log("🚀 ~ file: strategyAnalyzerServer.ts:55 ~ CENTRALIZATION_ENDPOINTS.USERS:", CENTRALIZATION_API_URLS.USERS);
        // const usersResponse = await apiConnector.get(CENTRALIZATION_API_URLS.USERS);
        // const usersResponse = await apiConnector.get("https://centralization.infinite-opportunities.pro/users");
        // const result = {}

        const usersResponse = await apiConnector.get(CENTRALIZATION_API_URLS.USERS);

        const users = await usersResponse.data;
        console.log("🚀 ~ file: strategyAnalyzerServer.ts:55 ~ users:", users);

        users.forEach((user) => {
            const userNotifs = user.notifications;
            Object.entries(userNotifs).forEach(([pairName, notificationObject]) => {
                console.log("🚀 ~ file: strategyAnalyzerServer.ts:61 ~ notificationDetails:", notificationObject);
                console.log("🚀 ~ file: strategyAnalyzerServer.ts:61 ~ pairName:", pairName);

                Object.entries(notificationObject).forEach(([timeframe, notificationDetails]) => {
                    console.log("🚀 ~ file: strategyAnalyzerServer.ts:66 ~ notificationDetails:", notificationDetails);
                    if (!aggregatedUserNotifications[pairName]) {
                        aggregatedUserNotifications[pairName] = {}
                    }
                    if (!aggregatedUserNotifications[pairName][timeframe]) {
                        aggregatedUserNotifications[pairName][timeframe] = {}
                    }

                    Object.entries(notificationDetails).forEach(([notificationType, noficationInfo]) => {
                        if (!aggregatedUserNotifications[pairName][timeframe][notificationType]) {
                            aggregatedUserNotifications[pairName][timeframe][notificationType] = {}
                        }

                        aggregatedUserNotifications[pairName][timeframe][notificationType] = noficationInfo
                    })

                    // console.log("🚀 ~ file: strategyAnalyzerServer.ts:60 ~ userNotifications:", userNotifications);
                })

            });
        })



        this.usersNotifications = aggregatedUserNotifications;
        fs.writeFileSync('usersNotifications.json', JSON.stringify(aggregatedUserNotifications));

    }

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
        const jsonPair = await convertPairToJSON(storePair)
        // fs.writeFileSync('jsonPair.json', JSON.stringify(jsonPair));

        // console.log("🚀 ~ file: strategyAnalyzerClass.ts:104 ~ jsonPair:", jsonPair);
        const symbolName = `${storePair.details.base_currency}/${storePair.details.quote_currency}`;
        const { rsi } = storePair;
        const timeframes = Object.keys(rsi);

        if (!this.notificationsSent[symbolName]) {
            this.notificationsSent[symbolName] = {};
        }

        timeframes.forEach(async (timeframe) => {
            const rsiTimeframe = rsi[timeframe].rsiData;
            const lastRSIValue = rsiTimeframe[rsiTimeframe.length - 1]?.value;
            console.log("🚀 ~ file: strategyAnalyzerClass.ts:124 ~ lastRSIValue:", lastRSIValue, symbolName, timeframe);
            const lastRSITime = unixTimestampToDate(rsiTimeframe[rsiTimeframe.length - 1]?.time);
            if (!lastRSIValue) {
                return;
            }

            const userPairs = this.usersNotifications[symbolName];
            console.log("🚀 ~ file: strategyAnalyzerClass.ts:131 ~  this.usersNotification:", userPairs);
            if (userPairs && userPairs[timeframe]) {
                console.log("🚀 ~ file: strategyAnalyzerClass.ts:132 ~ userPairs:", userPairs[timeframe]);
                const notifications = userPairs[timeframe]['RSI_Low_Alert'];
                for (const notificationId in notifications) {
                    const notification = notifications[notificationId];
                    console.log("🚀 ~ file: strategyAnalyzerClass.ts:135 ~ notification:", notificationId, notifications);
                    if (notification.preferences.status !== 'active') continue;

                    const userId = notification.userId;
                    const threshold = notification.parameters.threshold;
                    const notificationSent = notification.preferences.deliveryMethods.some(dm => dm.notificationStatus.notificationSent);

                    if (lastRSIValue <= threshold && !notificationSent) {
                        const notificationMessage = `RSI Low Alert: ${symbolName} on ${timeframe} is ${lastRSIValue.toFixed(3)} at ${lastRSITime}`
                        await sendNotification(notificationMessage, userId);
                        notification.preferences.deliveryMethods.forEach(dm => dm.notificationStatus.notificationSent = true);
                        console.log("🚀 ~ file: strategyAnalyzerClass.ts:143 ~ sendNotification:", notificationMessage);
                        fs.appendFileSync('notificationsLog.txt', `${notificationMessage}\n`);

                    } else if (lastRSIValue > threshold && notificationSent) {
                        notification.preferences.deliveryMethods.forEach(dm => dm.notificationStatus.notificationSent = false);
                    }
                }
            }
        });
    }
}
