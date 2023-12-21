import pkg from 'trading-shared'
const { apiConnector, BACKEND_URLS } = pkg;

// import { waitForServerToBeReady } from '../../common/beforeEach'


import { expect } from 'chai';
export async function waitForServerToBeReady(url, maxRetries = 5) {
    let retries = 0;
    while (retries < maxRetries) {
        try {
            // console.log("🚀 ~ file: routes.test.js:9 ~ url:", url);
            const result = await apiConnector.get(url)
            await expect(await result.status).to.equal(200);

            return; // Server is ready, exit the function
        } catch (error) {
            retries++;
            console.log(`Waiting for server to be ready... Attempt ${retries}`, error);
            await new Promise(resolve => setTimeout(resolve, 1000)); // Wait for 1 second before retrying
        }
    }

    throw new Error('Server did not become ready in time');
}


describe.only('Backend', () => {
    before(async function () {
        this.timeout(10000); // Increase timeout to 10 seconds
        await waitForServerToBeReady(BACKEND_URLS.HEALTH)
    })
    describe('routes', () => {
        it('health', async () => {
            const result = await apiConnector.get(BACKEND_URLS.HEALTH)
            expect(result.status).to.equal(200);

        });
        it('getLeverageSymbols', async () => {
            const result = await apiConnector.get(BACKEND_URLS.LEVERAGE_URLS.getLeverageSymbols)
            const data = await result.data

            expect(result.status).to.equal(200);
            expect(result.data.length).to.be.greaterThan(0);

        });

    });

});
