declare global {
  interface MarketData {
    time: number;
    pairName: string;
    timeframe: string;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
    upperBand: number;
    middleBand: number;
    lowerBand: number;
    ema: Record<string, number | null>;
    rsi: Record<string, number>;
  }
  interface Signal {
    id: string;
    type: 'buy' | 'sell';
    price: number;
    stopLoss?: number;
    takeProfit?: number;
    positionSize?: number;
  }

  interface Position {
    id: string;
    type: 'buy' | 'sell';
    entryPrice: number;
    stopLoss: number;
    takeProfit: number;
    size: number;
    leverage: number; // Added leverage field
    timestamp: number;
    pnl: number;
    closePrice?: number;
    appliedLeverage: number;
    // Additional position details
  }

  interface RiskManagementConfig {
    initialCapital: number;
    stopLossPercentage: number;
    takeProfitPercentage: number;
    riskPerTradePercentage: number;
    liquidationLevelPercentage: number;
  }
}

export default {};
