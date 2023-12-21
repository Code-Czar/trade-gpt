import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';

export class UsersNotificationsModel {
    private data: any;

    constructor() {
        this.data = {};
    }

    loadFromData(data: any) {
        this.data = data;
    }

    getData() {
        return this.data;
    }
    async loadUserNotifications() {
        const data = JSON.parse(fs.readFileSync('usersNotifications.json', 'utf-8'));
        this.loadFromData(data);
    }

    async saveUserNotifications() {
        fs.writeFileSync('usersNotifications.json', JSON.stringify(this.getData()));
    }


    addNotification(pairName: string, timeframe: string, notificationType: string, notificationDetails: any, notificationId?: string) {
        if (!this.data[pairName]) {
            this.data[pairName] = {};
        }

        if (!this.data[pairName][timeframe]) {
            this.data[pairName][timeframe] = {};
        }

        if (!this.data[pairName][timeframe][notificationType]) {
            this.data[pairName][timeframe][notificationType] = {};
        }

        const id = notificationId || uuidv4(); // Use provided UUID if available, otherwise generate a new one
        this.data[pairName][timeframe][notificationType][id] = notificationDetails;
    }

    removeNotification(pairName: string, timeframe: string, notificationType: string, notificationId: string) {
        if (this.data[pairName]?.[timeframe]?.[notificationType]?.[notificationId]) {
            delete this.data[pairName][timeframe][notificationType][notificationId];
        }
    }

    updateNotification(pairName: string, timeframe: string, notificationType: string, notificationId: string, newDetails: any) {
        if (this.data[pairName]?.[timeframe]?.[notificationType]?.[notificationId]) {
            this.data[pairName][timeframe][notificationType][notificationId] = newDetails;
        }
    }

    getNotification(userId: string, pairName: string, timeframe: string, notificationType: string) {
        return this.data[pairName]?.[timeframe]?.[notificationType]?.[userId];
    }
    getNotificationForPairAndTimeframe(pairName: string, timeframe: string, notificationType: string) {
        // Logic to retrieve specific notifications
        return this.data[pairName]?.[timeframe]?.[notificationType] || {};
    }

    markNotificationAsSent(notificationId: string) {
        // Iterate through all notifications to find and mark the specified notification as sent
        for (const pairName in this.data) {
            for (const timeframe in this.data[pairName]) {
                for (const type in this.data[pairName][timeframe]) {
                    if (this.data[pairName][timeframe][type][notificationId]) {
                        this.data[pairName][timeframe][type][notificationId].preferences.deliveryMethods.forEach(dm => dm.notificationStatus.notificationSent = true);
                        return;
                    }
                }
            }
        }
    }

    resetNotificationSentStatus(notificationId: string) {
        // Iterate through all notifications to find and reset the sent status of the specified notification
        for (const pairName in this.data) {
            for (const timeframe in this.data[pairName]) {
                for (const type in this.data[pairName][timeframe]) {
                    if (this.data[pairName][timeframe][type][notificationId]) {
                        this.data[pairName][timeframe][type][notificationId].preferences.deliveryMethods.forEach(dm => dm.notificationStatus.notificationSent = false);
                        return;
                    }
                }
            }
        }
    }
}


export default {
    UsersNotificationsModel
};