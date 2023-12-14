import pkg from 'trading-shared'
const { apiConnector, STRATEGY_ANALYZER_URLS } = pkg;


import { expect } from 'chai';

describe('Strategy-Analyzer', () => {
    describe('routes', () => {
        it('health', async () => {
            const result = await apiConnector.get(STRATEGY_ANALYZER_URLS.HEALTH)
            console.log("🚀 ~ file: userNotifications.test.js:11 ~ result:", await result);
            expect(await result.status).to.equal(200);

        });

    });

});
