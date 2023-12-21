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



describe('Strategy-Analyzer',function(){
    before(async function () {
        this.timeout(10000); // Increase timeout to 10 seconds
        await waitForServerToBeReady(STRATEGY_ANALYZER_URLS.HEALTH);
    });

    describe('routes',function(){
        
        it('health', async function(){
            const result = await apiConnector.get(STRATEGY_ANALYZER_URLS.HEALTH);
            expect(await result.status).to.equal(200);
        });

        it.only('loadUserNotifications', async function(){
            // console.log("🚀 ~ file: userNotifications.test.js:41 ~ STRATEGY_ANALYZER_URLS.USERS_NOTIFICATIONS.loadUserNotifications:", STRATEGY_ANALYZER_URLS.USERS_NOTIFICATIONS.loadUserNotifications);
            const result = await apiConnector.get(STRATEGY_ANALYZER_URLS.USERS_NOTIFICATIONS.loadUserNotifications);
            // console.log("🚀 ~ file: userNotifications.test.js:66 ~ result:", await result.data);

            expect(await result.status).to.equal(200);
            expect(Object.keys(await result.data).length).to.be.greaterThan(0)
            // Add more assertions as needed to check the response data
        });

        it('saveUserNotifications', async function(){
            const result = await apiConnector.post(STRATEGY_ANALYZER_URLS.USERS_NOTIFICATIONS.saveUserNotifications);
            expect(await result.status).to.equal(200);
            // Add more assertions as needed to check the response data
        });

        it('addNotification', async function(){
            const result = await apiConnector.post(STRATEGY_ANALYZER_URLS.USERS_NOTIFICATIONS.addNotification);
            expect(await result.status).to.equal(200);
            // Add more assertions as needed to check the response data
        });

        it.only('removeNotification', async function(){
            // Arrange
            this.timeout(10000);
            // 1. Get notifications
            let count = 0;
            let getResult = await apiConnector.get(STRATEGY_ANALYZER_URLS.USERS_NOTIFICATIONS.loadUserNotifications);
            let entries = Object.entries(await getResult.data);

            for (const [pairName, timeframesObject] of entries) {
                for (const [timeframeKey, alertObject] of Object.entries(timeframesObject)) {
                    for (const [alertName, alertContentObject] of Object.entries(alertObject)) {
                        // Act
                        // Remove each notification
                        const queryParams = {
                            pairName,
                            timeframe: timeframeKey,
                            notificationType: Object.values(alertContentObject)?.[0]?.type,
                            notificationId: Object.keys(alertContentObject)?.[0],
                        };
                        // // console.log("🚀 ~ file: userNotifications.test.js:80 ~ queryParams:", queryParams);

                        const result = await apiConnector.post(STRATEGY_ANALYZER_URLS.USERS_NOTIFICATIONS.removeNotification, queryParams);
                        // console.log("🚀 ~ result:", result);

                        // Check 
                        count += 1;
                        // console.log("🚀 ~ count:", count);
                        expect(await result.status).to.equal(200);
                        expect(await result.data.removed).to.equal(true);
                    }
                }
            }

            // Verify data is empty
            getResult = await apiConnector.get(STRATEGY_ANALYZER_URLS.USERS_NOTIFICATIONS.getUsersNotifications);
            entries = Object.entries(await getResult.data);
            expect(await entries.length).to.equal(0);




            // Add more assertions as needed to check the response data
        });

        it('updateNotification', async function(){
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

        it('getNotification', async function(){
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

        it('getNotificationForPairAndTimeframe', async function(){
            const queryParams = {
                pairName: 'someValue',
                timeframe: 'someValue',
                notificationType: 'someValue',
            };
            const result = await apiConnector.get(STRATEGY_ANALYZER_URLS.USERS_NOTIFICATIONS.getNotificationForPairAndTimeframe, queryParams);
            expect(await result.status).to.equal(200);
            // Add more assertions as needed to check the response data
        });

        it('markNotificationAsSent', async function(){
            const queryParams = {
                notificationId: 'someValue',
            };
            const result = await apiConnector.put(STRATEGY_ANALYZER_URLS.USERS_NOTIFICATIONS.markNotificationAsSent, queryParams);
            expect(await result.status).to.equal(200);
            // Add more assertions as needed to check the response data
        });

        it('resetNotificationSentStatus', async function(){
            const queryParams = {
                notificationId: 'someValue',
            };
            const result = await apiConnector.put(STRATEGY_ANALYZER_URLS.USERS_NOTIFICATIONS.resetNotificationSentStatus, queryParams);
            expect(await result.status).to.equal(200);
            // Add more assertions as needed to check the response data
        });
    });
});


