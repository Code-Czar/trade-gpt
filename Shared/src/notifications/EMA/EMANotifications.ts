import { preferences } from '../sharedPreferences';

type NotificationType = 'EMA_Notification';
type EMATimePeriod = 7 | 14 | 28 | 100 | 200 | number;

interface NotificationParameters {
  distanceFromEMA: number; //percents
  emaTimePeriod: EMATimePeriod; //EMA 9, 14, 28, 100, 200
  pairs: string[];
}

interface NotificationPreferences {
  status: string;
}

interface NotificationDescription {
  type: NotificationType;
  parameters: NotificationParameters;
  preferences: NotificationPreferences;
}

export const RSINotifDescription: NotificationDescription = {
  type: 'EMA_Notification',
  preferences,
  parameters: {
    distanceFromEMA: 0.05,
    emaTimePeriod: 7,
    pairs: ['BTC/USD', 'ETH/USD'],
  },
};
