import { Response, Request, NextFunction } from 'express';
import { UsersNotificationsController } from '@/controllers'; // Import the controller
import { AbstractView } from './AbstractView'; // Import the abstract view

const routesURLS = {
    getUsersNotifications: '/api/getUsersNotifications',
    loadUserNotifications: '/api/loadUserNotifications',
    saveUserNotifications: '/api/saveUserNotifications',
    addNotification: '/api/addNotification',
    removeNotification: '/api/removeNotification', // Removed URL parameters
    updateNotification: '/api/updateNotification', // Removed URL parameters
    getNotification: '/api/getNotification', // Removed URL parameters
    getNotificationForPairAndTimeframe: '/api/getNotificationForPairAndTimeframe',
    markNotificationAsSent: '/api/markNotificationAsSent', // Removed URL parameters
    resetNotificationSentStatus: '/api/resetNotificationSentStatus', // Removed URL parameters
};

export class UsersNotificationsView extends AbstractView {
    private usersNotificationsController: UsersNotificationsController;

    private routes = routesURLS;
    private expressApp = null;

    constructor(controller: UsersNotificationsController, app) {
        super();
        this.usersNotificationsController = controller;
        this.expressApp = app;
        this.bindExpressRoutes();
        // console.log("🚀 ~ file: usersNotificationsView.ts:26 ~ this.usersNotificationsController:", this.usersNotificationsController);
    }

    bindExpressRoutes() {
        // Getters
        this.expressApp.get(this.routes.getUsersNotifications, this.wrapAsync(this.getUsersNotifications.bind(this)));
        this.expressApp.get(this.routes.loadUserNotifications, this.wrapAsync(this.loadUserNotifications.bind(this)));

        // Setters
        this.expressApp.post(this.routes.saveUserNotifications, this.wrapAsync(this.saveUserNotifications.bind(this)));
        this.expressApp.post(this.routes.addNotification, this.wrapAsync(this.addNotification.bind(this)));

        // Updaters
        this.expressApp.put(this.routes.updateNotification, this.wrapAsync(this.updateNotification.bind(this)));

        // Removers
        this.expressApp.post(this.routes.removeNotification, this.wrapAsync(this.removeNotification.bind(this)));

        // Getters
        this.expressApp.get(this.routes.getNotification, this.wrapAsync(this.getNotification.bind(this)));
        this.expressApp.get(this.routes.getNotificationForPairAndTimeframe, this.wrapAsync(this.getNotificationForPairAndTimeframe.bind(this)));

        // Updaters
        this.expressApp.put(this.routes.markNotificationAsSent, this.wrapAsync(this.markNotificationAsSent.bind(this)));
        this.expressApp.put(this.routes.resetNotificationSentStatus, this.wrapAsync(this.resetNotificationSentStatus.bind(this)));
    }

    private wrapAsync(fn: Function) {
        return (req: Request, res: Response, next: NextFunction) => {
            fn(req, res, next).catch(next);
        };
    }

    async loadUserNotifications(req: Request, res: Response) {
        try {
            // Your code to load user notifications here
            const notifications = await this.usersNotificationsController.loadUserNotifications(req, res);
            res.status(200).json(notifications);
        } catch (error) {
            console.error("Error loading user notifications:", error);
            res.status(500).json({ error: "Internal Server Error" });
        }
    }

    async saveUserNotifications(req: Request, res: Response) {
        try {
            // Your code to save user notifications here
            const result = await this.usersNotificationsController.saveUserNotifications(req, res);
            res.status(200).json(result);
        } catch (error) {
            console.error("Error saving user notifications:", error);
            res.status(500).json({ error: "Internal Server Error" });
        }
    }

    async getUsersNotifications(req: Request, res: Response) {
        try {
            // Your code to get user notifications here
            const notifications = await this.usersNotificationsController.getUsersNotifications(req, res);
            res.status(200).json(notifications);
        } catch (error) {
            console.error("Error getting user notifications:", error);
            res.status(500).json({ error: "Internal Server Error" });
        }
    }


    async addNotification(req: Request, res: Response) {
        try {
            // Your code to add a notification here
            const result = await this.usersNotificationsController.addNotification(req, res);
            res.status(200).json(result);
        } catch (error) {
            console.error("Error adding a notification:", error);
            res.status(500).json({ error: "Internal Server Error" });
        }
    }

    async removeNotification(req: Request, res: Response) {
        try {
            // Your code to remove a notification here
            const { pairName, timeframe, notificationType, notificationId } = req.body;
            console.log("🚀 ~ file: usersNotificationsView.ts:97 ~ req.query:", req.body);
            const result = await this.usersNotificationsController.removeNotification(
                {
                    pairName,
                    timeframe,
                    notificationType,
                    notificationId
                }
            );
            res.status(200).json({ removed: result });
        } catch (error) {
            console.error("Error removing a notification:", error);
            res.status(500).json({ error: "Internal Server Error" });
        }
    }

    async updateNotification(req: Request, res: Response) {
        try {
            // Your code to update a notification here
            const { pairName, timeframe, notificationType, notificationId } = req.query;
            const result = await this.usersNotificationsController.updateNotification(
                pairName,
                timeframe,
                notificationType,
                notificationId
            );
            res.status(200).json(result);
        } catch (error) {
            console.error("Error updating a notification:", error);
            res.status(500).json({ error: "Internal Server Error" });
        }
    }

    async getNotification(req: Request, res: Response) {
        try {
            // Your code to get a notification here
            const { userId, pairName, timeframe, notificationType } = req.query;
            const notification = await this.usersNotificationsController.getNotification(
                userId,
                pairName,
                timeframe,
                notificationType
            );
            if (notification) {
                res.status(200).json(notification);
            } else {
                res.status(404).json({ error: "Notification not found" });
            }
        } catch (error) {
            console.error("Error getting a notification:", error);
            res.status(500).json({ error: "Internal Server Error" });
        }
    }

    async getNotificationForPairAndTimeframe(req: Request, res: Response) {
        try {
            // Your code to get a notification for pair and timeframe here
            const { pairName, timeframe, notificationType } = req.query;
            const notification = await this.usersNotificationsController.getNotificationForPairAndTimeframe(
                pairName,
                timeframe,
                notificationType
            );
            if (notification) {
                res.status(200).json(notification);
            } else {
                res.status(404).json({ error: "Notification not found" });
            }
        } catch (error) {
            console.error("Error getting a notification for pair and timeframe:", error);
            res.status(500).json({ error: "Internal Server Error" });
        }
    }

    async markNotificationAsSent(req: Request, res: Response) {
        try {
            // Your code to mark a notification as sent here
            const { notificationId } = req.query;
            const result = await this.usersNotificationsController.markNotificationAsSent(notificationId);
            res.status(200).json(result);
        } catch (error) {
            console.error("Error marking a notification as sent:", error);
            res.status(500).json({ error: "Internal Server Error" });
        }
    }

    async resetNotificationSentStatus(req: Request, res: Response) {
        try {
            // Your code to reset notification sent status here
            const { notificationId } = req.query;
            const result = await this.usersNotificationsController.resetNotificationSentStatus(notificationId);
            res.status(200).json(result);
        } catch (error) {
            console.error("Error resetting notification sent status:", error);
            res.status(500).json({ error: "Internal Server Error" });
        }
    }
}
