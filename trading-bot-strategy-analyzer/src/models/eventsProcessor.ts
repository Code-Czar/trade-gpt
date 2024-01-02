import { TradingContext } from './strategies/TradingContext';

export class EventProcessor {
  constructor() {}

  processEvent(candle: MarketData, strategyContext: TradingContext, previousCandleData?: MarketData[]): void {
    const strategySignals = strategyContext.executeStrategy(candle, previousCandleData);
    if (strategySignals.length > 0) {
      console.log('🚀 ~ file: eventsProcessor.ts:15 ~ strategySignals:', strategySignals);
    }
    const riskManager = strategyContext.getRiskManager();

    const positionsToUpdate = riskManager.evaluateSignalsAndPositions(
      strategySignals,
      strategyContext.getOpenedPositions(),
      candle.close,
    );

    strategyContext.updatePositions(positionsToUpdate, candle.close, candle.timestamp);
  }
}
