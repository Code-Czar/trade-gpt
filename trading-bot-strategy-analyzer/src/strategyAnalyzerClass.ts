import { sendNotification } from './notifiers';
import { formatOHLCVForChartData, computeEMASignals, unixTimestampToDate } from 'trading-shared';
import { UsersNotificationsModel } from './models';

const LOWER_RSI_THRESHOLD = 50;

export class StrategyAnalyzer {
  private usersNotificationsModel: UsersNotificationsModel = new UsersNotificationsModel();
  public pastRSISignals = {};
  public pastEMA28Signals = {};
  public notificationsSent = {};

  constructor() {
    (async () => {
      this.usersNotificationsModel.loadUserNotifications();
    })();
  }

  public async init() {}

  public async analyzeEMAPastData(realTimeData) {
    const { storePair } = realTimeData;
    const symbolName = storePair.details.name;
    const { ema, ohlcvs } = storePair;
    const timeframes = Object.keys(ema);
    timeframes.forEach((timeframe) => {
      const formattedData = formatOHLCVForChartData(ohlcvs[timeframe], symbolName, timeframe);
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
    const { storePair, timeframe } = realTimeData;
    const symbolName = `${storePair.details.base_currency}/${storePair.details.quote_currency}`;
    const data = storePair.data[timeframe];
    // const timeframes = Object.keys(rsi);

    // timeframes.forEach(async (timeframe) => {
    const lastRSIValue = data[data.length - 1].rsi;
    global.logger.debug('🚀 ~ file: strategyAnalyzerClass.ts:75 ~ data[data.length - 1]:', data[data.length - 1]);
    const lastRSITime = unixTimestampToDate(data[data.length - 1].time);

    if (!lastRSIValue) return;

    const userPairs = this.usersNotificationsModel.getNotificationForPairAndTimeframe(
      symbolName,
      timeframe,
      'RSI_Low_Alert',
    );
    // console.log('🚀 ~ file: strategyAnalyzerClass.ts:80 ~ userPairs:', this.usersNotificationsModel.getData());
    // console.log('🚀 ~ file: strategyAnalyzerClass.ts:80 ~ userPairs:', userPairs);

    if (userPairs) {
      for (const notificationId in userPairs) {
        const notification = userPairs[notificationId];
        if (notification.preferences.status !== 'active') continue;

        const userId = notification.userId;
        const threshold = notification.parameters.threshold;
        const notificationSent = notification.preferences.deliveryMethods.some(
          (dm) => dm.notificationStatus.notificationSent,
        );

        if (lastRSIValue <= threshold && !notificationSent) {
          const notificationMessage = `RSI Low Alert: ${symbolName} on ${timeframe} is ${lastRSIValue.toFixed(
            3,
          )} at ${lastRSITime}`;
          console.log('🚀 ~ file: strategyAnalyzerClass.ts:96 ~ notificationMessage:', notificationMessage);
          await sendNotification(notificationMessage, userId);
          this.usersNotificationsModel.markNotificationAsSent(notificationId);
          this.usersNotificationsModel.saveUserNotifications();
        } else if (lastRSIValue > threshold && notificationSent) {
          this.usersNotificationsModel.resetNotificationSentStatus(notificationId);
          this.usersNotificationsModel.saveUserNotifications();
        }
      }
    }
    // });
  }
}
