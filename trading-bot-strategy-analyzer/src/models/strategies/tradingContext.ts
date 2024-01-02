import { TradingStrategy } from './abstractTradingStrategy';
import { Position, RiskManager, Signal } from '../riskManager'; // Assuming Position and Signal are defined in RiskManager
import { v4 as uuidv4 } from 'uuid';

const fs = require('fs');

export class TradingContext {
  private strategy: TradingStrategy;
  private openedPositions: Position[] = [];
  private logPositions: Position[] = [];
  private moneyAmount: number;
  private riskManager;

  constructor(strategy: TradingStrategy, config: any) {
    this.strategy = strategy;
    this.riskManager = new RiskManager(config.riskManagement);
    this.moneyAmount = config.riskManagement.initialCapital;
  }

  setStrategy(strategy: TradingStrategy) {
    this.strategy = strategy;
  }

  executeStrategy(currentCandle: MarketData, previousCandleData?: MarketData[]) {
    return this.strategy.execute(currentCandle, previousCandleData);
  }

  public getOpenedPositions(): Position[] {
    return this.openedPositions;
  }

  public updatePositions(
    positionsToUpdate: { positionsToOpen: Signal[]; positionsToClose: string[] },
    currentMarketPrice: number,
    currentTimestamp,
  ) {
    // Open new positions
    positionsToUpdate.positionsToOpen.forEach((signal) => {
      this.openPosition(signal, currentMarketPrice, currentTimestamp);
    });

    // Close specified positions
    positionsToUpdate.positionsToClose.forEach((positionId) => {
      this.closePosition(positionId, currentMarketPrice, currentTimestamp);
    });
  }

  private openPosition(signal: Signal, currentMarketPrice: number, currentTimestamp) {
    const newPosition: Position = {
      id: uuidv4(), // Use UUID for a unique identifier
      type: signal.type,
      entryPrice: currentMarketPrice,
      stopLoss: signal.stopLoss,
      takeProfit: signal.takeProfit,
      size: signal.positionSize,
      appliedLeverage: signal.appliedLeverage, // Assuming leverage is part of the signal
      timestamp: currentTimestamp, // Timestamp of position opening
    };
    this.openedPositions.push(newPosition);
    // Log the opening of the position
    this.logPosition(newPosition);
  }

  private closePosition(positionId: string, currentMarketPrice: number, currentTimestamp) {
    const positionIndex = this.openedPositions.findIndex((pos) => pos.id === positionId);
    if (positionIndex !== -1) {
      const position = this.openedPositions[positionIndex];
      position.closePrice = currentMarketPrice; // Assuming closePrice is part of Position
      position.closeTimestamp = currentTimestamp; // Timestamp of position closing
      this.moneyAmount += position.pnl;

      this.logPosition(position);

      // Log the closing of the position
      console.log('Position closed:', position);

      // Remove or mark the position as closed
      this.openedPositions.splice(positionIndex, 1);
    }
  }

  private logPosition(position) {
    this.logPositions.push(position);
    fs.writeFileSync('positionsLog.log', JSON.stringify(this.logPositions));
  }

  public getRiskManager() {
    return this.riskManager;
  }

  public getLogPositions() {
    return this.logPositions;
  }
  public getMoneyAmount() {
    return this.moneyAmount;
  }

  // Additional methods and logic as needed...
}
