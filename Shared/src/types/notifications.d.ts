export interface NotificationParameters {
  threshold: number;
  pairs: string[];
}

export interface NotificationPreferences {
  status: string;
  // preferences: any;  // You can further define the structure of preferences if needed
}

export interface NotificationDescription {
  type: NotificationType;
  parameters: NotificationParameters;
  preferences: NotificationPreferences;
  timeframe: string;
  pairName: string;
  notificationId: string;
  userId: string;
}
