const { InfluxDBWrapper, reconstructDataStructure } = require('trading-shared');
const { RSIDivergenceStrategy } = require('./strategies/strategyDefinitions/RSIDivergenceStrategy');

export class BacktestingModel {
  constructor() {
    this.influxDBWrapper = new InfluxDBWrapper();
    this.strategies = {
      'RSI-Divergence': new RSIDivergenceStrategy(),
      // Add other strategies here
    };
  }

  async startBacktest(backtestParams) {
    const {
      strategyName,
      pair,
      timeRangeStart,
      timeRangeStop,
      fields,
      initialInvestment,
      stopLoss,
      takeProfit,
      leverage,
    } = backtestParams;

    const strategy = this.strategies[strategyName];
    console.log('🚀 ~ file: backtestingModel.ts:27 ~ strategy:', strategy);
    if (!strategy) {
      throw new Error(`Strategy ${strategyName} not found`);
    }

    const validFields = fields || [
      'open',
      'high',
      'low',
      'close',
      'volumes',
      'rsi',
      'ema7',
      'ema14',
      'ema28',
      'ema100',
      'ema200',
    ];
    const data = await this.influxDBWrapper.getPairData(pair, timeRangeStart, timeRangeStop, ['1d'], validFields);
    const reconstructedData = reconstructDataStructure(pair, data.leveragePairs[pair].ohlcvs);
    const strategyResult = strategy.execute(reconstructedData);

    const tradeSettings = { initialInvestment, stopLoss, takeProfit, leverage };
    const trades = strategy.calculateTradeOutcome(reconstructedData, tradeSettings);

    return {
      strategyResult,
      trades, // Each trade includes entry price, exit type, exit price, and P&L
    };
  }
}
