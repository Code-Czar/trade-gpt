// Define specific types for notification request status and delivery methods
enum NotificationRequestStatus {
    NONE = 'none',
    SUCCESS = 'success',
    FAILURE = 'failure'
}

enum DeliveryMethodType {
    EMAIL = 'email',
    PUSH_NOTIFICATIONS = 'pushNotifications'
}

enum FrequencyType {
    ONCE = 'once',
    RECURRING = 'recurring' // Example, add more if needed
}

interface NotificationStatus {
    notificationSent: boolean;
    requestStatus: NotificationRequestStatus;
    requestError: NotificationRequestStatus;
}

interface DeliveryMethod {
    via: DeliveryMethodType;
    notificationStatus: NotificationStatus;
}

interface SharedPreferences {
    deliveryMethods: DeliveryMethod[];
    frequency: FrequencyType;
}

interface Preferences {
    pairName: string;
    status: string;
    preferences: SharedPreferences;
}

// Notification status object
const notificationStatus: NotificationStatus = {
    notificationSent: false,
    requestStatus: NotificationRequestStatus.NONE,
    requestError: NotificationRequestStatus.NONE
};

// Shared preferences object
export const sharedPreferences: SharedPreferences = {
    deliveryMethods: [
        {
            via: DeliveryMethodType.EMAIL,
            notificationStatus: { ...notificationStatus }
        },
        {
            via: DeliveryMethodType.PUSH_NOTIFICATIONS,
            notificationStatus: { ...notificationStatus }
        }
    ],
    frequency: FrequencyType.ONCE
};

// User preferences object
export const preferences: Preferences = {
    status: "active",
    pairName: '',
    preferences: { ...sharedPreferences }
};
