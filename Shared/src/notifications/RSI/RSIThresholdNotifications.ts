import { preferences } from '../sharedPreferences'

type NotificationType = "RSI_Low_Alert" | "RSI_High_Alert";


interface NotificationParameters {
    threshold: number;
    pairs: string[];
}

interface NotificationPreferences {
    status: string;
    preferences: any;  // You can further define the structure of preferences if needed
}

interface NotificationDescription {
    type: NotificationType;
    parameters: NotificationParameters;
    preferences: NotificationPreferences;
}

export const RSINotifDescription: NotificationDescription = {
    type: "RSI_Low_Alert", // Can only be "RSI_Low_Alert" or "RSI_High_Alert"
    preferences,
    parameters: {
        threshold: 30,
        pairs: ["BTC/USD", "ETH/USD"]
    },
};


