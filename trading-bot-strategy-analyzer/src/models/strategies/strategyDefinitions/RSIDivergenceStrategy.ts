import { TradingStrategy } from '../abstractTradingStrategy';

export class RSIDivergenceStrategy extends TradingStrategy {
  constructor() {
    super('RSIDivergenceStrategy');
  }

  execute(currentCandleData: MarketData, previousCandleData: MarketData[]) {
    let buySellSignals = [];
    const { buyThreshold, sellThreshold } = this.config.parameters;

    for (let i = 1; i < previousCandleData.length; i++) {
      const prev = previousCandleData[i - 1];
      const current = currentCandleData;

      if (current?.rsi?.rsi14 < buyThreshold && this.isBullishDivergence(prev, current)) {
        if (!buySellSignals.find((value) => value.timestamp === current.timestamp)) {
          buySellSignals.push({ type: 'buy', price: current.close, timestamp: current.timestamp });
        }
      } else if (current?.rsi?.rsi14 > sellThreshold && this.isBearishDivergence(prev, current)) {
        if (!buySellSignals.find((value) => value.timestamp === current.timestamp)) {
          buySellSignals.push({ type: 'sell', price: current.close, timestamp: current.timestamp });
        }
      }
    }

    return buySellSignals;
  }

  // execute(currentCandleData: MarketData, previousCandleData: MarketData[]) {
  //   const { buyThreshold, sellThreshold } = this.config.parameters;

  //   for (let i = 1; i < previousCandleData.length; i++) {
  //     const prev = previousCandleData[i - 1];
  //     const current = currentCandleData;

  //     if (current?.rsi?.rsi14 < buyThreshold && this.isBullishDivergence(prev, current)) {
  //       if (!Object.values(this.buySellSignals).find((value) => value.timestamp === current.timestamp)) {
  //         const id = uuidv4();
  //         this.buySellSignals[id] = { id, type: 'buy', price: current.close, timestamp: current.timestamp };
  //       }
  //     } else if (current?.rsi?.rsi14 > sellThreshold && this.isBearishDivergence(prev, current)) {
  //       const id = uuidv4();
  //       if (!Object.values(this.buySellSignals).find((value) => value.timestamp === current.timestamp)) {
  //         this.buySellSignals[id] = { id, type: 'sell', price: current.close, timestamp: current.timestamp };
  //       }
  //     }
  //   }

  //   return this.buySellSignals;
  // }

  isBullishDivergence(prev: MarketData, current: MarketData) {
    if (!prev?.rsi?.rsi14 || !current?.rsi?.rsi14) {
      return false;
    }
    return prev.low > current.low && prev.rsi.rsi14 < current.rsi.rsi14;
  }

  isBearishDivergence(prev: MarketData, current: MarketData) {
    if (!prev?.rsi?.rsi14 || !current?.rsi?.rsi14) {
      return false;
    }
    return prev.high < current.high && prev.rsi.rsi14 > current.rsi.rsi14;
  }
}
