import { Express } from 'express';
import { StrategyManagerView } from '../views/strategyManagerView';
import { StrategyManager } from '../models/strategyManager'; // Adjust the import path as needed

export class StrategyManagerController {
  private strategyManager: StrategyManager;
  private view: StrategyManagerView;

  constructor(app: Express) {
    this.strategyManager = new StrategyManager();
    this.view = new StrategyManagerView(this, app);
  }

  getStrategies(): StrategyManager[] {
    // Logic to get available strategies
    // For example, using this.strategyManager
    try {
      const strategies = this.strategyManager.getAvailableStrategies();
      return strategies;
    } catch (error) {
      console.error('Error getting strategies:', error);
      return [];
    }
  }

  getStrategyContext(strategyName: string) {
    return this.strategyManager.getStrategyContext(strategyName);
  }

  public executeStrategy(strategyContext, data: any): any {
    const strategyResult = this.strategyManager.executeStrategy(strategyContext, data);
    return strategyResult;
  }

  // Additional methods...
}
