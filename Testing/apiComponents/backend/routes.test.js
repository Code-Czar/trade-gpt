import pkg from 'trading-shared'
const { apiConnector, BACKEND_URLS } = pkg;


import { assert, expect } from 'chai';

describe('Backend', () => {
    describe('routes', () => {
        it('health', async () => {
            const result = await apiConnector.get(BACKEND_URLS.HEALTH)
            // console.log("🚀 ~ file: firstTest.test.js:11 ~ result:", result);
            expect(result.status).to.equal(200);

            // Assert that the sum is correct
        });
        it('getLeverageSymbols', async () => {
            const result = await apiConnector.get(BACKEND_URLS.LEVERAGE_URLS.getLeverageSymbols)
            // console.log("🚀 ~ file: firstTest.test.js:11 ~ result:", result);
            expect(result.status).to.equal(200);

            // Assert that the sum is correct
        });

        // You can add more test cases here
    });

    // You can test more functions here
});
