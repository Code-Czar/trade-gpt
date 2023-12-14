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
        await waitForServerToBeReady(STRATEGY_ANALYZER_URLS.HEALTH)
    })
    describe('routes', () => {
        it('health', async () => {
            const result = await apiConnector.get(STRATEGY_ANALYZER_URLS.HEALTH)
            expect(await result.status).to.equal(200);

        });

    });

});
