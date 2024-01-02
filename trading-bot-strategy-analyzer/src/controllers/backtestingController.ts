import { DataController } from './DataController';
import { TradingController } from './TradingController';
import { BacktestingView } from '../views/BacktestingView'; // Adjust the path as needed
import { StrategyManagerController } from './strategyManagerController';

interface BacktestParams {
  pair: string;
  strategyName: string;
  timeframe: string;
  startDate?: Date;
  endDate?: Date;
  fields?: Array<string>;
  // Add other relevant parameters for data fetching
}

export class BacktestingController {
  private dataController: DataController;
  private tradingController: TradingController;
  private strategyManagerController: StrategyManagerController;
  private view: BacktestingView;

  constructor(
    dataController: DataController,
    strategyManagerController: StrategyManagerController,
    tradingController: TradingController,
    expressApp,
  ) {
    this.dataController = dataController;
    this.tradingController = tradingController;
    this.strategyManagerController = strategyManagerController;
    this.view = new BacktestingView(this, expressApp);
  }

  // Method to start a backtest
  async startBacktest(backtestParams: BacktestParams) {
    try {
      // Fetch data from InfluxDB
      let backtestResults;
      const candleData = await this.dataController.fetchData(backtestParams);
      for (const pair of Object.keys(candleData)) {
        for (const timeframe of Object.keys(candleData[pair])) {
          // console.log('🚀 ~ file: backtestingController.ts:31 ~ candleData:', candleData, candleData[pair], timeframe);

          // Start backtest in TradingController with the fetched data
          backtestResults = await this.tradingController.startBacktest(
            backtestParams.strategyName,
            candleData[pair][timeframe],
          );
        }
      }
      return backtestResults;
    } catch (error) {
      console.error('Error starting backtest:', error);
      throw error;
    }
  }
}
