// const OneSignal = require('@onesignal/node-onesignal');
import * as OneSignal from '@onesignal/node-onesignal';

const APP_ID = 'c9f90795-f921-4717-92b2-3dd1e9405b30';
const REST_API_KEY = "NTA3Mjc0OGItYWUyNS00Y2M3LWJlMGMtZTRiZTI4YzQ2ZDY0"

const app_key_provider = {
    getToken() {
        return REST_API_KEY;
    }
};

const configuration = OneSignal.createConfiguration({
    authMethods: {
        app_key: {
            tokenProvider: app_key_provider
        }
    }
});
const client = new OneSignal.DefaultApi(configuration);



// Define the notification content
export const sendNotification = async (message: string) => {
    const notification = new OneSignal.Notification();
    notification.app_id = APP_ID;
    notification.included_segments = ['All'];
    notification.contents = {
        en: message
    };
    notification.data = {
        message
    };
    notification.custom_data = {
        message
    };
    const { id } = await client.createNotification(notification);
    global.logger.debug("🚀 ~ file: notificationsSender.ts:35 ~ sendNofitication ~ id:", id)
};
