import { Request, Response } from 'express';
import { UsersNotificationsModel } from '../models'; // Replace with the correct path to your model
import { UsersNotificationsView } from '../views'; // Import the view

export class UsersNotificationsController {
    private model: UsersNotificationsModel;
    private view: UsersNotificationsView; // Instantiate the view
    private expressApp = null;

    constructor(app) {
        this.expressApp = app;
        this.model = new UsersNotificationsModel();
        this.view = new UsersNotificationsView(this, app);
        // this.view.setRoutes(app)
    }

    async getView (){
        return this.view
    }

    async loadUserNotifications(req: Request, res: Response) {
        try {
            await this.model.loadUserNotifications();
            const data = this.model.getData();
            this.view.renderData(res, data); // Use the view to render the response
        } catch (error) {
            this.view.renderError(res, 'Internal Server Error'); // Use the view to render the error response
        }
    }

    async saveUserNotifications(req: Request, res: Response) {
        try {
            await this.model.saveUserNotifications();
            this.view.renderMessage(res, 'Data saved successfully'); // Use the view to render a success message
        } catch (error) {
            this.view.renderError(res, 'Internal Server Error'); // Use the view to render the error response
        }
    }

    addNotification(req: Request, res: Response) {
        const { pairName, timeframe, notificationType, notificationDetails, notificationId } = req.body;

        try {
            this.model.addNotification(pairName, timeframe, notificationType, notificationDetails, notificationId);
            this.view.renderMessage(res, 'Notification added successfully'); // Use the view to render a success message
        } catch (error) {
            this.view.renderError(res, 'Bad Request'); // Use the view to render the error response
        }
    }

    removeNotification(req: Request, res: Response) {
        const { pairName, timeframe, notificationType, notificationId } = req.params;

        try {
            this.model.removeNotification(pairName, timeframe, notificationType, notificationId);
            this.view.renderMessage(res, 'Notification removed successfully'); // Use the view to render a success message
        } catch (error) {
            this.view.renderError(res, 'Notification not found'); // Use the view to render the error response
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
