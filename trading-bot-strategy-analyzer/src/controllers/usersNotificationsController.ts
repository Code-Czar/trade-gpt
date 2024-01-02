import { Request, Response } from 'express';
import { UsersNotificationsModel } from '../models'; // Replace with the correct path to your model
import { UsersNotificationsView } from '../views'; // Import the view
import { NotificationDescription } from 'trading-shared';

export class UsersNotificationsController {
  private model: UsersNotificationsModel;
  private view: UsersNotificationsView; // Instantiate the view
  private expressApp = null;

  constructor(app) {
    this.expressApp = app;
    this.model = new UsersNotificationsModel();
    this.view = new UsersNotificationsView(this, app);
    // this.view.setRoutes(app)
    (async () => await this.getUserNotifications())();
  }

  async getView() {
    return this.view;
  }

  async getUserNotifications(from = null, storeLocally = true) {
    let usersNotifications;
    try {
      usersNotifications = await this.model.loadUserNotifications(from, storeLocally);
      console.log('🚀 ~ file: usersNotificationsController.ts:26 ~ usersNotifications:', usersNotifications);
      return usersNotifications;
    } catch (error) {
      global.logger.error(
        '🚀 ~ file: usersNotificationsController.ts:29 ~ usersNotifications:',
        usersNotifications,
        error,
      );
    }
  }

  async saveUserNotifications(notificationData, storeLocally = true) {
    let saveResult;
    try {
      saveResult = await this.model.saveUserNotifications(notificationData, storeLocally);
      return saveResult;
    } catch (error) {
      global.logger.error('🚀 ~ file: usersNotificationsController.ts:36 ~ saveResult:', saveResult, error);
    }
  }

  async getUsersNotifications() {
    let usersNotifications;
    try {
      usersNotifications = await this.model.getUsersNotifications();
      return usersNotifications;
    } catch (error) {
      global.logger.error(
        '🚀 ~ file: usersNotificationsController.ts:46 ~ usersNotifications:',
        usersNotifications,
        error,
      );
    }
  }

  async addNotification(notificationDetails) {
    let addResult;
    try {
      addResult = await this.model.addNotification(notificationDetails);
      return addResult;
    } catch (error) {
      global.logger.error('🚀 ~ file: usersNotificationsController.ts:56 ~ addResult:', addResult, error);
    }
  }

  async removeNotification(inputNotification: NotificationDescription, storeLocally = true) {
    let removeResult;
    try {
      removeResult = await this.model.removeNotification(inputNotification, storeLocally);
      return removeResult;
    } catch (error) {
      global.logger.error('🚀 ~ file: usersNotificationsController.ts:66 ~ removeResult:', removeResult, error);
    }
  }

  updateNotification(req: Request, res: Response) {
    const { pairName, timeframe, notificationType, notificationId } = req.params;
    const newDetails = req.body;

    try {
      this.model.updateNotification(pairName, timeframe, notificationType, notificationId, newDetails);
      this.view.renderMessage(res, 'Notification updated successfully'); // Use the view to render a success message
    } catch (error) {
      this.view.renderError(res, 'Notification not found'); // Use the view to render the error response
    }
  }

  getNotification(req: Request, res: Response) {
    const { userId, pairName, timeframe, notificationType } = req.params;

    const notification = this.model.getNotification(userId, pairName, timeframe, notificationType);

    if (notification) {
      this.view.renderData(res, notification); // Use the view to render the response
    } else {
      this.view.renderError(res, 'Notification not found'); // Use the view to render the error response
    }
  }

  getNotificationForPairAndTimeframe(req: Request, res: Response) {
    const { pairName, timeframe, notificationType } = req.params;

    const notifications = this.model.getNotificationForPairAndTimeframe(pairName, timeframe, notificationType);
    this.view.renderData(res, notifications); // Use the view to render the response
  }

  markNotificationAsSent(req: Request, res: Response) {
    const { notificationId } = req.params;

    try {
      this.model.markNotificationAsSent(notificationId);
      this.view.renderMessage(res, 'Notification marked as sent'); // Use the view to render a success message
    } catch (error) {
      this.view.renderError(res, 'Notification not found'); // Use the view to render the error response
    }
  }

  resetNotificationSentStatus(req: Request, res: Response) {
    const { notificationId } = req.params;

    try {
      this.model.resetNotificationSentStatus(notificationId);
      this.view.renderMessage(res, 'Notification sent status reset'); // Use the view to render a success message
    } catch (error) {
      this.view.renderError(res, 'Notification not found'); // Use the view to render the error response
    }
  }
}
