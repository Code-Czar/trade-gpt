import { EventProcessor, NotificationSystem } from '../models';
import { StrategyManagerController } from './strategyManagerController';

export class TradingController {
  private strategyManagerController: StrategyManagerController;
  private eventProcessor: EventProcessor;
  private notificationSystem: NotificationSystem;

  constructor(strategyManagerController: StrategyManagerController) {
    this.strategyManagerController = strategyManagerController;

    this.notificationSystem = new NotificationSystem();
    this.eventProcessor = new EventProcessor();
  }

  async startBacktest(strategyName, inputCandleData: MarketData[]) {
    const strategyContext = this.strategyManagerController.getStrategyContext(strategyName);
    console.log('🚀 ~ file: tradingController.ts:24 ~ strategyToApply:', strategyName);
    try {
      for (const candle of inputCandleData) {
        this.eventProcessor.processEvent(candle, strategyContext, inputCandleData);
      }
      return this.collectBacktestResults(strategyContext, inputCandleData);
    } catch (error) {
      console.error('Error in backtesting:', error);
      throw error;
    }
  }

  private collectBacktestResults(strategyContext, inputCandleData) {
    const result = {
      moneyAmount: strategyContext.moneyAmount,
      logs: strategyContext.getLogPositions(),
      inputCandleData,
    };
    return result;
  }
}
