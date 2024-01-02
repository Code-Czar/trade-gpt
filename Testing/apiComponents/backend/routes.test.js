const { expect } = require('chai');

const { apiConnector, BACKEND_URLS, sleep } = require('trading-shared');
const { waitForServerToBeReady } = require('../../common/beforeEach');
const { saveResultToFile } = require('../../common/afterEach');
const { startAllServices } = require('../../common/beforeEach');
// const { stopAllServices, saveResultToFile } = require('../../common/afterEach');
const { startBackend } = require('../../common/startServers');

describe('Backend', () => {
  before(async function () {
    this.timeout(10000);
    resultProcesses = await startBackend();
    await sleep(5000);
    await waitForServerToBeReady(BACKEND_URLS.HEALTH);
  });
  describe('routes', () => {
    it('health', async () => {
      const result = await apiConnector.get(BACKEND_URLS.HEALTH);
      expect(result.status).to.equal(200);
    });
    it('clear database', async function () {
      this.timeout(10000);
      const result = await apiConnector.post(BACKEND_URLS.CLEAR_DATABASE);
      const data = await result.data;
      console.log('🚀 ~ file: routes.test.js:25 ~ data:', data);
      await sleep(7000);

      expect(result.status).to.equal(200);
    });
    it('getLeverageSymbols', async () => {
      const result = await apiConnector.get(BACKEND_URLS.LEVERAGE_URLS.getLeverageSymbols);
      const data = await result.data;

      expect(result.status).to.equal(200);
      expect(result.data.length).to.be.greaterThan(0);

      saveResultToFile(data, 'leverageSymbols.json');
    });

    it('should get historical data for BTCUSDT', async function () {
      this.timeout(10000000000);

      // Check it can get all data for 1d timeframe
      const pairName = 'BTCUSDT';

      let timeframes = ['1d'];
      let pair;
      let result;

      // result = await apiConnector.post(BACKEND_URLS.FETCH_HISTORICAL_DATA, {
      //   pairName,
      //   timeframes,
      // });
      // await sleep(30000);
      // pair = await result.data?.pair;
      // console.log('🚀 ~ file: routes.test.js:47 ~ result:', pair);
      // expect(result.status).to.equal(200);
      // expect(pair.details.name).to.be.equal('BTCUSDT');
      // expect(pair.data['1d'].length).to.be.greaterThan(2000);

      // // Check it can get all data for 1h timeframe
      // timeframes = ['1h'];
      // result = await apiConnector.post(BACKEND_URLS.FETCH_HISTORICAL_DATA, {
      //   pairName,
      //   timeframes,
      // });
      // await sleep(7000);
      // pair = await result.data?.pair;
      // console.log('🚀 ~ file: routes.test.js:47 ~ result:', pair);
      // expect(result.status).to.equal(200);
      // expect(pair.details.name).to.be.equal('BTCUSDT');
      // expect(pair.data['1h'].length).to.be.greaterThan(60000);

      // Check it can get all data for 5m timeframe
      timeframes = ['5m'];
      result = await apiConnector.post(BACKEND_URLS.FETCH_HISTORICAL_DATA, {
        pairName,
        timeframes,
      });
      await sleep(7000);
      pair = await result.data?.pair;
      console.log('🚀 ~ file: routes.test.js:47 ~ result:', pair);
      expect(result.status).to.equal(200);
      expect(pair.details.name).to.be.equal('BTCUSDT');
      expect(pair.data['5m'].length).to.be.greaterThan(700000);

      // // Check it can get all data for 1m timeframe
      // timeframes = ['1m'];
      // result = await apiConnector.post(BACKEND_URLS.FETCH_HISTORICAL_DATA, {
      //   pairName,
      //   timeframes,
      // });
      // await sleep(100000);
      // pair = await result.data?.pair;
      // console.log('🚀 ~ file: routes.test.js:47 ~ result:', pair);
      // expect(result.status).to.equal(200);
      // expect(pair.details.name).to.be.equal('BTCUSDT');
      // expect(pair.data['1m'].length).to.be.greaterThan(2000);
    });

    // it.skip('should get all historical data', async function () {
    //   this.timeout(10000000000);
    //   const result = await apiConnector.post(BACKEND_URLS.FETCH_ALL_HISTORICAL_DATA);
    //   const data = await result.data;
    //   console.log('🚀 ~ file: routes.test.js:47 ~ result:', result);
    //   await sleep(7000);

    //   expect(result.status).to.equal(200);
    // });
    it('should get pairData', async function () {
      this.timeout(100000);
      await sleep(15000);

      const result = await apiConnector.post(BACKEND_URLS.GET_PAIR_DATA, { pairName: 'BTCUSDT', timeframe: '1d' });
      const data = await result.data;
      console.log('🚀 ~ file: routes.test.js:47 ~ result:', result);
      saveResultToFile(data, 'BTCUSD_pair.json');

      await sleep(7000);

      expect(result.status).to.equal(200);
    });
  });
});
