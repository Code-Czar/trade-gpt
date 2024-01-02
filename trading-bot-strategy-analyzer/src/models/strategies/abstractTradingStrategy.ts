import fs from 'fs';
import path from 'path';

export abstract class TradingStrategy {
  protected config: any;

  constructor(strategyName: string) {
    this.config = this.loadStrategyConfig(strategyName);
  }

  private loadStrategyConfig(strategyName: string): any {
    const configPath = path.join(__dirname, 'strategyDefinitions', `${strategyName}.json`);
    try {
      const configFile = fs.readFileSync(configPath, 'utf8');
      return JSON.parse(configFile);
    } catch (error) {
      console.error(`Error loading config for strategy '${strategyName}':`, error);
      throw error;
    }
  }

  abstract execute(currentCandle: MarketData, previousData?: MarketData[]): any;
}
