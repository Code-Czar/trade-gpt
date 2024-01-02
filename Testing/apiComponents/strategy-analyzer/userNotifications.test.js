const { apiConnector, STRATEGY_ANALYZER_URLS } = require('trading-shared');
const { startAllServices } = require('../../common/beforeEach');
const { stopAllServices, saveResultToFile } = require('../../common/afterEach');
const { expect } = require('chai');

let resultProcesses;
const sampleNotifications = {
  type: 'RSI_Low_Alert',
  preferences: {
    status: 'active',
    pairName: '',
    deliveryMethods: [
      {
        via: 'email',
        notificationStatus: {
          notificationSent: false,
          requestStatus: 'none',
          requestError: 'none',
        },
      },
      {
        via: 'pushNotifications',
        notificationStatus: {
          notificationSent: false,
          requestStatus: 'none',
          requestError: 'none',
        },
      },
    ],
    frequency: 'once',
  },
  parameters: {
    threshold: 36,
  },
  pairName: 'BTC/USD',
  timeframe: '1d',
  userId: '2b3e4e09-b424-4368-9788-a8a8b7c154d4',
};

describe.skip('Strategy-Analyzer', function () {
  before(async function () {
    resultProcesses = await startAllServices.bind(this)(this);
  });
  describe('routes', function () {
    it('health', async function () {
      const result = await apiConnector.get(STRATEGY_ANALYZER_URLS.HEALTH);
      expect(await result.status).to.equal(200);
    });

    it('loadUserNotifications from file', async function () {
      // console.log("🚀 ~ file: userNotifications.test.js:41 ~ STRATEGY_ANALYZER_URLS.USERS_NOTIFICATIONS.loadUserNotifications:", STRATEGY_ANALYZER_URLS.USERS_NOTIFICATIONS.loadUserNotifications);
      const result = await apiConnector.post(STRATEGY_ANALYZER_URLS.USERS_NOTIFICATIONS.loadUserNotifications, {
        from: 'file',
      });
      // console.log("🚀 ~ file: userNotifications.test.js:66 ~ result:", await result.data);

      expect(await result.status).to.equal(200);
      expect(Object.keys(await result.data).length).to.be.greaterThan(0);
      // Add more assertions as needed to check the response data
    });
    it('loadUserNotifications from API', async function () {
      // console.log("🚀 ~ file: userNotifications.test.js:41 ~ STRATEGY_ANALYZER_URLS.USERS_NOTIFICATIONS.loadUserNotifications:", STRATEGY_ANALYZER_URLS.USERS_NOTIFICATIONS.loadUserNotifications);
      const result = await apiConnector.post(STRATEGY_ANALYZER_URLS.USERS_NOTIFICATIONS.loadUserNotifications, {
        from: 'API',
      });
      // console.log("🚀 ~ file: userNotifications.test.js:66 ~ result:", await result.data);

      console.log('🚀 ~ file: userNotifications.test.js:36 ~ result.data:', result.data);
      await saveResultToFile(result, 'loadUserNotifFromAPI.json');
      expect(await result.status).to.equal(200);
      expect(Object.keys(await result.data).length).to.be.greaterThan(0);
      // Add more assertions as needed to check the response data
    });

    it('saveUserNotifications', async function () {
      const result = await apiConnector.post(STRATEGY_ANALYZER_URLS.USERS_NOTIFICATIONS.saveUserNotifications);
      expect(await result.status).to.equal(200);
      // Add more assertions as needed to check the response data
    });

    it('addNotification', async function () {
      const result = await apiConnector.post(
        STRATEGY_ANALYZER_URLS.USERS_NOTIFICATIONS.addNotification,
        sampleNotifications,
      );
      expect(await result.status).to.equal(200);
      // Add more assertions as needed to check the response data
    });

    it('removeAllNotifications', async function () {
      // Arrange
      this.timeout(1000000);
      // 1. Get notifications
      let count = 0;
      let getResult = await apiConnector.post(STRATEGY_ANALYZER_URLS.USERS_NOTIFICATIONS.loadUserNotifications, {
        from: 'API',
      });
      console.log('🚀 ~ file: userNotifications.test.js:60 ~ getResult:', getResult);
      let entries = Object.entries(await getResult.data);

      for (const [pairName, timeframesObject] of entries) {
        for (const [timeframeKey, alertObject] of Object.entries(timeframesObject)) {
          for (const [alertName, alertContentObject] of Object.entries(alertObject)) {
            // Act
            // Remove each notification
            const queryParams = {
              notificationId: Object.keys(alertContentObject)?.[0],
              ...Object.values(alertContentObject)?.[0],
            };
            if (!queryParams.notificationId) {
              continue;
            }

            console.log('🚀 ~ file: userNotifications.test.js:80 ~ queryParams:', queryParams);

            const result = await apiConnector.post(
              STRATEGY_ANALYZER_URLS.USERS_NOTIFICATIONS.removeNotification,
              queryParams,
            );
            console.log('🚀 ~ result:', result);

            // Check
            count += 1;
            // console.log("🚀 ~ count:", count);
            expect(await result.status).to.equal(200);
            expect(await result.data.deletedLocally).to.equal(true);
            expect(await result.data.deletedInAPI).to.equal(true);
          }
        }
      }

      // Verify data is empty
      getResult = await apiConnector.get(STRATEGY_ANALYZER_URLS.USERS_NOTIFICATIONS.getUsersNotifications);
      entries = Object.entries(await getResult.data);
      expect(await entries.length).to.equal(0);

      // Add more assertions as needed to check the response data
    });

    it('updateNotification', async function () {
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

    //   it('getNotification', async function () {
    //     const queryParams = {
    //       userId: 'someValue',
    //       pairName: 'someValue',
    //       timeframe: 'someValue',
    //       notificationType: 'someValue',
    //     };
    //     const result = await apiConnector.get(STRATEGY_ANALYZER_URLS.USERS_NOTIFICATIONS.getNotification, queryParams);
    //     expect(await result.status).to.equal(200);
    //     // Add more assertions as needed to check the response data
    //   });

    //   it('getNotificationForPairAndTimeframe', async function () {
    //     const queryParams = {
    //       pairName: 'someValue',
    //       timeframe: 'someValue',
    //       notificationType: 'someValue',
    //     };
    //     const result = await apiConnector.get(
    //       STRATEGY_ANALYZER_URLS.USERS_NOTIFICATIONS.getNotificationForPairAndTimeframe,
    //       queryParams,
    //     );
    //     expect(await result.status).to.equal(200);
    //     // Add more assertions as needed to check the response data
    //   });

    //   it('markNotificationAsSent', async function () {
    //     const queryParams = {
    //       notificationId: 'someValue',
    //     };
    //     const result = await apiConnector.put(
    //       STRATEGY_ANALYZER_URLS.USERS_NOTIFICATIONS.markNotificationAsSent,
    //       queryParams,
    //     );
    //     expect(await result.status).to.equal(200);
    //     // Add more assertions as needed to check the response data
    //   });

    //   it('resetNotificationSentStatus', async function () {
    //     const queryParams = {
    //       notificationId: 'someValue',
    //     };
    //     const result = await apiConnector.put(
    //       STRATEGY_ANALYZER_URLS.USERS_NOTIFICATIONS.resetNotificationSentStatus,
    //       queryParams,
    //     );
    //     expect(await result.status).to.equal(200);
    //     // Add more assertions as needed to check the response data
    //   });
  });
});

after(() => {
  stopAllServices(resultProcesses);
});
