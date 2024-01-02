export class RiskManager {
  private config: RiskManagementConfig;

  constructor(config: RiskManagementConfig) {
    this.config = config;
  }

  public evaluateSignalsAndPositions(
    newSignals: Signal[],
    openPositions: Position[],
    currentMarketPrice,
  ): { positionsToOpen: Signal[]; positionsToClose: string[] } {
    const positionsToOpen: Signal[] = [];
    const positionsToClose: any[] = [];

    // Evaluate new signals for opening positions
    newSignals.forEach((signal) => {
      if (this.isSignalAcceptable(signal)) {
        positionsToOpen.push(this.calculateRiskAdjustedSignal(signal));
      }
    });

    // Evaluate open positions for closing
    openPositions.forEach((position) => {
      const positionStatus = this.shouldClosePosition(position, currentMarketPrice);
      if (positionStatus.shouldClose) {
        positionsToClose.push({ position, ...positionStatus });
      }
    });

    return { positionsToOpen, positionsToClose };
  }

  private isSignalAcceptable(signal: Signal): boolean {
    // Implement logic to check if a new signal is acceptable based on risk rules
    // Example: checking leverage, risk per trade, etc.
    return true; // Placeholder logic
  }

  private calculateRiskAdjustedSignal(signal: Signal): Signal {
    // Adjust the signal based on risk rules, e.g., position size, stop loss, take profit
    signal.stopLoss = this.calculateStopLoss(signal.price, signal.type);
    signal.takeProfit = this.calculateTakeProfit(signal.price, signal.type);
    signal.positionSize = this.calculatePositionSize(signal.price);
    signal.appliedLeverage = this.config.appliedLeverage;
    return signal;
  }

  private calculateStopLoss(price: number, type: 'buy' | 'sell'): number {
    const leverageFactor = this.config.appliedLeverage;
    const adjustedStopLossPercentage = this.config.stopLossPercentage / leverageFactor;
    return type === 'buy'
      ? price * (1 - adjustedStopLossPercentage / 100)
      : price * (1 + adjustedStopLossPercentage / 100);
  }

  private calculateTakeProfit(price: number, type: 'buy' | 'sell'): number {
    const leverageFactor = this.config.appliedLeverage;
    const adjustedTakeProfitPercentage = this.config.takeProfitPercentage / leverageFactor;
    return type === 'buy'
      ? price * (1 + adjustedTakeProfitPercentage / 100)
      : price * (1 - adjustedTakeProfitPercentage / 100);
  }

  private calculatePositionSize(price: number): number {
    const riskAmount = this.config.initialCapital * (this.config.riskPerTradePercentage / 100);
    console.log('🚀 ~ file: riskManager.ts:67 ~ riskAmount:', riskAmount);
    return (riskAmount / price) * this.config.appliedLeverage; // Simplified position size calculation
  }

  shouldClosePosition(
    position: Position,
    currentMarketPrice: number,
  ): { shouldClose: boolean; reason: string; closePrice?: number; pnl: number } {
    let plPercentage = this.calculatePLPercentage(position, currentMarketPrice);
    // console.log(
    //   '🚀 ~ file: riskManager.ts:75 ~ plPercentage:',
    //   plPercentage,
    //   position,
    //   currentMarketPrice,
    //   this.config.appliedLeverage,
    //   this.config.initialCapital,
    //   this.config.riskPerTradePercentage,
    // );

    // Check for stop-loss condition
    if (
      (position.type === 'buy' && currentMarketPrice <= position.stopLoss) ||
      plPercentage <= 0 ||
      plPercentage <= this.config.stopLossPercentage
    ) {
      return { shouldClose: true, reason: 'stopLoss', closePrice: currentMarketPrice, pnl: plPercentage };
    } else if (position.type === 'sell' && currentMarketPrice >= position.stopLoss) {
      return { shouldClose: true, reason: 'stopLoss', closePrice: currentMarketPrice, pnl: plPercentage };
    }

    // Check for take-profit condition
    if (
      (position.type === 'buy' && currentMarketPrice >= position.takeProfit) ||
      plPercentage >= this.config.takeProfitPercentage
    ) {
      return { shouldClose: true, reason: 'takeProfit', closePrice: currentMarketPrice, pnl: plPercentage };
    } else if (position.type === 'sell' && currentMarketPrice <= position.takeProfit) {
      return { shouldClose: true, reason: 'takeProfit', closePrice: currentMarketPrice, pnl: plPercentage };
    }

    // Check for liquidation condition
    if (plPercentage <= -this.config.liquidationLevelPercentage) {
      return { shouldClose: true, reason: 'liquidation', closePrice: currentMarketPrice, pnl: plPercentage };
    }

    return { shouldClose: false, reason: 'none', pnl: plPercentage };
  }

  private calculatePLPercentage(position: Position, currentMarketPrice: number): number {
    let pl =
      position.type === 'buy'
        ? (currentMarketPrice - position.entryPrice) / position.entryPrice
        : (position.entryPrice - currentMarketPrice) / position.entryPrice;

    // Adjust the P&L by the leverage factor
    return pl * 100 * position.appliedLeverage;
  }
}
