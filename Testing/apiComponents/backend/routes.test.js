import pkg from 'trading-shared'
const { apiConnector, BACKEND_URLS } = pkg;


import { expect } from 'chai';

describe('Backend', () => {
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
