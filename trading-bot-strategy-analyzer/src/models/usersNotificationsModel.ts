import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';

export class UsersNotificationsModel {
    private usersNotifs: any;

    constructor() {
        this.usersNotifs = {};
    }

    loadFromData(data: any) {
        this.usersNotifs = data;
    }

    getData() {
        return this.usersNotifs;
    }
    async loadUserNotifications() {
        const data = JSON.parse(fs.readFileSync('usersNotifications.json', 'utf-8'));
        this.loadFromData(data);
    }

    async saveUserNotifications() {
        fs.writeFileSync('usersNotifications.json', JSON.stringify(this.getData()));
    }

    async getUsersNotifications() {
        return this.usersNotifs;
    }


    addNotification(pairName: string, timeframe: string, notificationType: string, notificationDetails: any, notificationId?: string) {
        if (!this.usersNotifs[pairName]) {
            this.usersNotifs[pairName] = {};
        }

        if (!this.usersNotifs[pairName][timeframe]) {
            this.usersNotifs[pairName][timeframe] = {};
        }

        if (!this.usersNotifs[pairName][timeframe][notificationType]) {
            this.usersNotifs[pairName][timeframe][notificationType] = {};
        }

        const id = notificationId || uuidv4(); // Use provided UUID if available, otherwise generate a new one
        this.usersNotifs[pairName][timeframe][notificationType][id] = notificationDetails;
    }

    removeNotification(pairName: string, timeframe: string, notificationType: string, notificationId: string) {
        if (this.usersNotifs[pairName]?.[timeframe]?.[notificationType]?.[notificationId]) {
            delete this.usersNotifs[pairName][timeframe][notificationType][notificationId];
            if (Object.keys(this.usersNotifs[pairName][timeframe][notificationType]).length === 0) {
                delete this.usersNotifs[pairName][timeframe][notificationType]
            }
            if (Object.keys(this.usersNotifs[pairName][timeframe]).length === 0) {
                delete this.usersNotifs[pairName][timeframe]
            }
            if (Object.keys(this.usersNotifs[pairName]).length === 0) {
                delete this.usersNotifs[pairName]
            }
            return true
        }
        return false
    }

    updateNotification(pairName: string, timeframe: string, notificationType: string, notificationId: string, newDetails: any) {
        if (this.usersNotifs[pairName]?.[timeframe]?.[notificationType]?.[notificationId]) {
            this.usersNotifs[pairName][timeframe][notificationType][notificationId] = newDetails;
        }
    }

    getNotification(userId: string, pairName: string, timeframe: string, notificationType: string) {
        return this.usersNotifs[pairName]?.[timeframe]?.[notificationType]?.[userId];
    }
    getNotificationForPairAndTimeframe(pairName: string, timeframe: string, notificationType: string) {
        // Logic to retrieve specific notifications
        return this.usersNotifs[pairName]?.[timeframe]?.[notificationType] || {};
    }

    markNotificationAsSent(notificationId: string) {
        // Iterate through all notifications to find and mark the specified notification as sent
        for (const pairName in this.usersNotifs) {
            for (const timeframe in this.usersNotifs[pairName]) {
                for (const type in this.usersNotifs[pairName][timeframe]) {
                    if (this.usersNotifs[pairName][timeframe][type][notificationId]) {
                        this.usersNotifs[pairName][timeframe][type][notificationId].preferences.deliveryMethods.forEach(dm => dm.notificationStatus.notificationSent = true);
                        return;
                    }
                }
            }
        }
    }

    resetNotificationSentStatus(notificationId: string) {
        // Iterate through all notifications to find and reset the sent status of the specified notification
        for (const pairName in this.usersNotifs) {
            for (const timeframe in this.usersNotifs[pairName]) {
                for (const type in this.usersNotifs[pairName][timeframe]) {
                    if (this.usersNotifs[pairName][timeframe][type][notificationId]) {
                        this.usersNotifs[pairName][timeframe][type][notificationId].preferences.deliveryMethods.forEach(dm => dm.notificationStatus.notificationSent = false);
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