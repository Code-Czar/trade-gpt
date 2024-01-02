import { v4 as uuidv4 } from 'uuid';
import {
  apiConnector,
  CENTRALIZATION_API_URLS,
  mergeObjects,
  deleteNestedKey,
  NotificationDescription,
  ensureNestedKeysExist,
} from 'trading-shared';
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
  async loadUserNotifications(from = 'API', storeLocally = true) {
    let data;
    if (from === 'file') {
      global.logger.debug('🚀 ~ file: usersNotificationsModel.ts:22 ~ from:', from);

      data = JSON.parse(fs.readFileSync('usersNotifications.json', 'utf-8'));
    } else {
      data = await this.loadUserNotificationsFromAPI();
    }
    if (storeLocally) {
      this.loadFromData(data);
    }

    return data;
  }
  async loadUserNotificationsFromAPI(updateLocalStore = true, saveToFile = true) {
    const result = await apiConnector.get(CENTRALIZATION_API_URLS.USERS);
    let merged = {};

    result.data.forEach((user) => {
      merged = mergeObjects(merged, user.notifications);
    });
    if (updateLocalStore) {
      this.usersNotifs = merged;
    }
    if (saveToFile) {
      this.saveUserNotifications();
    }

    return merged;
  }

  async saveUserNotifications() {
    fs.writeFileSync('usersNotifications.json', JSON.stringify(this.getData()));
  }

  async getUsersNotifications() {
    return this.usersNotifs;
  }

  async addNotification(inputNotification, storeInAPI = true) {
    const addNotificationResult = {
      addedLocally: false,
      addedToAPI: false,
    };
    const { pairName, timeframe, type, notificationId } = inputNotification;

    if (!this.usersNotifs[pairName]) {
      this.usersNotifs[pairName] = {};
    }

    if (!this.usersNotifs[pairName][timeframe]) {
      this.usersNotifs[pairName][timeframe] = {};
    }

    if (!this.usersNotifs[pairName][timeframe][type]) {
      this.usersNotifs[pairName][timeframe][type] = {};
    }

    const id = notificationId || uuidv4(); // Use provided UUID if available, otherwise generate a new one
    this.usersNotifs[pairName][timeframe][type][id] = inputNotification;
    addNotificationResult.addedLocally = true;

    if (storeInAPI) {
      const result = await apiConnector.get(`${CENTRALIZATION_API_URLS.USERS}/${inputNotification.userId}`);
      const userNotifications = result.data.notifications;
      ensureNestedKeysExist(userNotifications, [pairName, timeframe, type, id]);
      userNotifications[pairName][timeframe][type][id] = inputNotification;
      result.data.userNotifications = userNotifications;
      const updateResult = await apiConnector.patch(
        `${CENTRALIZATION_API_URLS.USERS}/${inputNotification.userId}`,
        result.data,
      );
      if (updateResult.status === 200) {
        global.logger.debug(
          '🚀 ~ file: usersNotificationsModel.ts:115 ~ removeNotification ~ updateResult:',
          updateResult,
        );

        addNotificationResult.addedToAPI = true;
      } else {
        global.logger.error(
          '🚀 ~ file: usersNotificationsModel.ts:115 ~ removeNotification ~ updateResult:',
          updateResult,
        );
      }
    }
    return addNotificationResult;
  }

  async removeNotification(inputNotification: NotificationDescription, updateAPI = true) {
    const { pairName, timeframe, type, notificationId } = inputNotification;
    console.log('🚀 ~ file: usersNotificationsModel.ts:77 ~ notificationId:', notificationId);
    console.log('🚀 ~ file: usersNotificationsModel.ts:77 ~ notificationType:', type);
    console.log('🚀 ~ file: usersNotificationsModel.ts:77 ~ timeframe:', timeframe);
    console.log('🚀 ~ file: usersNotificationsModel.ts:77 ~ pairName:', pairName);
    const deletionResult = {
      deletedLocally: false,
      deletedInAPI: false,
    };
    if (this.usersNotifs[pairName]?.[timeframe]?.[type]?.[notificationId]) {
      delete this.usersNotifs[pairName][timeframe][type][notificationId];
      console.log(
        '🚀 ~ file: usersNotificationsModel.ts:128 ~ this.usersNotifs[pairName][timeframe][type][notificationId];:',
        this.usersNotifs[pairName][timeframe][type][notificationId],
      );
      if (Object.keys(this.usersNotifs[pairName][timeframe][type]).length === 0) {
        delete this.usersNotifs[pairName][timeframe][type];
      }
      if (Object.keys(this.usersNotifs[pairName][timeframe]).length === 0) {
        delete this.usersNotifs[pairName][timeframe];
      }
      if (Object.keys(this.usersNotifs[pairName]).length === 0) {
        delete this.usersNotifs[pairName];
      }
      deletionResult.deletedLocally = true;
      console.log('🚀 ~ file: usersNotificationsModel.ts:128 ~ this.usersNotifs:', this.usersNotifs);
    }

    if (updateAPI) {
      const result = await apiConnector.get(`${CENTRALIZATION_API_URLS.USERS}/${inputNotification.userId}`);
      global.logger.debug('🚀 ~ file: usersNotificationsModel.ts:112 ~ result:', result);
      const userNotifications = result.data.notifications;
      console.log('🚀 ~ file: usersNotificationsModel.ts:149 ~ userNotifications:', userNotifications);
      deleteNestedKey(userNotifications, inputNotification.notificationId);
      result.data.notification = userNotifications;
      const updateResult = await apiConnector.patch(
        `${CENTRALIZATION_API_URLS.USERS}/${inputNotification.userId}`,
        result.data,
      );
      console.log('🚀 ~ file: usersNotificationsModel.ts:163 ~ result.data:', result.data);
      if (updateResult.status === 200) {
        global.logger.debug(
          '🚀 ~ file: usersNotificationsModel.ts:115 ~ removeNotification ~ updateResult:',
          updateResult,
        );

        deletionResult.deletedInAPI = true;
      } else {
        global.logger.error(
          '🚀 ~ file: usersNotificationsModel.ts:115 ~ removeNotification ~ updateResult:',
          updateResult,
        );
      }
    }

    return deletionResult;
  }

  updateNotification(
    pairName: string,
    timeframe: string,
    notificationType: string,
    notificationId: string,
    newDetails: any,
  ) {
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
            this.usersNotifs[pairName][timeframe][type][notificationId].preferences.deliveryMethods.forEach(
              (dm) => (dm.notificationStatus.notificationSent = true),
            );
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
            this.usersNotifs[pairName][timeframe][type][notificationId].preferences.deliveryMethods.forEach(
              (dm) => (dm.notificationStatus.notificationSent = false),
            );
            return;
          }
        }
      }
    }
  }
}

export default {
  UsersNotificationsModel,
};
