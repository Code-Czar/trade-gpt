import pkg from 'trading-shared'
const { apiConnector, STRATEGY_ANALYZER_URLS } = pkg;
// import { waitForServerToBeReady } from '../../common/beforeEach';

import { expect } from 'chai';
// Function to check if the server is up and running
export async function waitForServerToBeReady(url, maxRetries = 5) {
    let retries = 0;
    while (retries < maxRetries) {
        try {
            const result = await apiConnector.get(url)
            await expect(await result.status).to.equal(200);

            return; // Server is ready, exit the function
        } catch (error) {
            retries++;
            console.log(`Waiting for server to be ready... Attempt ${retries}`);
            await new Promise(resolve => setTimeout(resolve, 1000)); // Wait for 1 second before retrying
        }
    }

    throw new Error('Server did not become ready in time');
}



describe('Strategy-Analyzer', () => {
    before(async function () {
        this.timeout(10000); // Increase timeout to 10 seconds
        await waitForServerToBeReady(STRATEGY_ANALYZER_URLS.HEALTH);
    });

    describe('routes', () => {
        it('health', async () => {
            const result = await apiConnector.get(STRATEGY_ANALYZER_URLS.HEALTH);
            expect(await result.status).to.equal(200);
        });

        it('loadUserNotifications', async () => {
            const result = await apiConnector.get(STRATEGY_ANALYZER_URLS.USERS_NOTIFICATIONS.loadUserNotifications);
            expect(await result.status).to.equal(200);
            // Add more assertions as needed to check the response data
        });

        it('saveUserNotifications', async () => {
            const result = await apiConnector.post(STRATEGY_ANALYZER_URLS.USERS_NOTIFICATIONS.saveUserNotifications);
            expect(await result.status).to.equal(200);
            // Add more assertions as needed to check the response data
        });

        it('addNotification', async () => {
            const result = await apiConnector.post(STRATEGY_ANALYZER_URLS.USERS_NOTIFICATIONS.addNotification);
            expect(await result.status).to.equal(200);
            // Add more assertions as needed to check the response data
        });

        it('removeNotification', async () => {
            const queryParams = {
                pairName: 'someValue',
                timeframe: 'someValue',
                notificationType: 'someValue',
                notificationId: 'someValue',
            };
            const result = await apiConnector.delete(STRATEGY_ANALYZER_URLS.USERS_NOTIFICATIONS.removeNotification, queryParams);
            expect(await result.status).to.equal(200);
            // Add more assertions as needed to check the response data
        });

        it('updateNotification', async () => {
            const queryParams = {
                pairName: 'someValue',
                timeframe: 'someValue',
                notificationType: 'someValue',
                notificationId: 'someValue',
            };
            const result = await apiConnector.put(STRATEGY_ANALYZER_URLS.USERS_NOTIFICATIONS.updateNotification, queryParams);
            expect(await result.status).to.equal(200);
            // Add more assertions as needed to check the response data
        });

        it('getNotification', async () => {
            const queryParams = {
                userId: 'someValue',
                pairName: 'someValue',
                timeframe: 'someValue',
                notificationType: 'someValue',
            };
            const result = await apiConnector.get(STRATEGY_ANALYZER_URLS.USERS_NOTIFICATIONS.getNotification, queryParams);
            expect(await result.status).to.equal(200);
            // Add more assertions as needed to check the response data
        });

        it('getNotificationForPairAndTimeframe', async () => {
            const queryParams = {
                pairName: 'someValue',
                timeframe: 'someValue',
                notificationType: 'someValue',
            };
            const result = await apiConnector.get(STRATEGY_ANALYZER_URLS.USERS_NOTIFICATIONS.getNotificationForPairAndTimeframe, queryParams);
            expect(await result.status).to.equal(200);
            // Add more assertions as needed to check the response data
        });

        it('markNotificationAsSent', async () => {
            const queryParams = {
                notificationId: 'someValue',
            };
            const result = await apiConnector.put(STRATEGY_ANALYZER_URLS.USERS_NOTIFICATIONS.markNotificationAsSent, queryParams);
            expect(await result.status).to.equal(200);
            // Add more assertions as needed to check the response data
        });

        it('resetNotificationSentStatus', async () => {
            const queryParams = {
                notificationId: 'someValue',
            };
            const result = await apiConnector.put(STRATEGY_ANALYZER_URLS.USERS_NOTIFICATIONS.resetNotificationSentStatus, queryParams);
            expect(await result.status).to.equal(200);
            // Add more assertions as needed to check the response data
        });
    });
});


