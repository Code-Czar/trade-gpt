const { expect } = require('chai');
const { InfluxDBWrapper, reconstructDataStructure, apiConnector, STRATEGY_ANALYZER_URLS } = require('trading-shared'); // Update with actual path
const { saveResultToFile, stopAllServices } = require('../../../common/afterEach');
const { startAllServices } = require('../../../common/beforeEach');

let resultProcesses;

describe.only('InfluxDB Data Retrieval', function () {
  this.timeout(100000);
  let influxDBWrapper;

  before(async function () {
    influxDBWrapper = new InfluxDBWrapper();
    resultProcesses = await startAllServices.bind(this)(this);
    // Any setup if needed
  });

  it('should retrieve data from InfluxDB', async function () {
    const pair = 'BTCUSDT'; // Example pair
    const timeRangeStart = '-10y'; // Last hour
    const timeRangeStop = 'now()'; // Current time
    const fields = await influxDBWrapper.listFieldsForPair(pair);
    console.log('🚀 ~ file: strategyTesting.test.js:17 ~ fields:', fields);
    const data = await influxDBWrapper.getPairData(
      pair,
      timeRangeStart,
      timeRangeStop,
      ['1d'],
      ['open', 'high', 'low', 'close', 'volumes', 'rsi', 'ema7', 'ema14', 'ema28', 'ema100', 'ema200'],
    );

    console.log('🚀 ~ file: strategyTesting.test.js:15 ~ data:', await data);
    const dataArray = data.leveragePairs[pair].ohlcvs;
    const reconstructed = reconstructDataStructure(pair, dataArray);
    // console.log('🚀 ~ file: strategyTesting.test.js:23 ~ dataArray:', dataArray);

    await saveResultToFile(reconstructed, 'dataPoints.json');

    expect(data).to.be.an('object'); // Or any other assertion based on the expected data structure
    expect(data).to.have.property(pair);
  });

  it.only('should start backtesting strategy', async function () {
    const result = await apiConnector.post(STRATEGY_ANALYZER_URLS.BACKTESTING.startBacktest, {
      strategyName: 'RSIDivergenceStrategy',
      pairs: ['BTCUSDT'],
      timeRangeStart: '-10y',
      timeRangeStop: 'now()',
      fields: ['rsi14'],
      timeframes: ['1d', '1h'],
      initialInvestment: 1000,
      stopLoss: 50,
      takeProfit: 100,
      leverage: 50,
    });
    console.log('🚀 ~ file: strategyTesting.test.js:42 ~ result:', result);
    expect(result.status).to.equal(200);
  });

  // Add more tests as needed

  after(() => {
    stopAllServices();
  });
});
