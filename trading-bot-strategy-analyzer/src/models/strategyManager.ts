import fs from 'fs';
import path from 'path';
import { TradingContext } from './strategies/TradingContext';
import { TradingStrategy } from './strategies/TradingStrategy';

interface IStrategyConfig {
  strategyName: string;
}

const DEFAULT_STRATEGY_CONFIG_PATH: string = `${__dirname}/strategies/strategyDefinitions`;

export class StrategyManager {
  private contexts: TradingContext[];

  constructor(strategyConfigPath: string = DEFAULT_STRATEGY_CONFIG_PATH) {
    this.contexts = [];
    this.loadAllStrategyConfigs(strategyConfigPath);
  }

  private loadAllStrategyConfigs(strategyConfigPath: string): void {
    const files = fs.readdirSync(strategyConfigPath);

    files.forEach((file) => {
      if (path.extname(file) === '.json') {
        const filePath = path.join(strategyConfigPath, file);
        this.loadStrategyConfig(filePath);
      }
    });
  }

  private loadStrategyConfig(filePath: string): void {
    const config: IStrategyConfig = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    const strategyClass = this.getStrategyClass(config.strategyName);

    if (!strategyClass) {
      throw new Error(`Strategy class for '${config.strategyName}' not found`);
    }

    const strategyInstance = new strategyClass(config);
    const context = new TradingContext(strategyInstance, config);
    this.contexts.push(context);
  }

  private getStrategyClass(strategyName: string): typeof TradingStrategy | undefined {
    try {
      const strategyModule = require(`${DEFAULT_STRATEGY_CONFIG_PATH}/${strategyName}.ts`);
      return strategyModule[strategyName];
    } catch (error) {
      console.error(`Error loading strategy '${strategyName}':`, error);
      return undefined;
    }
  }

  public executeStrategy(strategyContext, data: any): any {
    return strategyContext.executeStrategy(data);
  }

  public getStrategyContext(strategyName: string): TradingContext | undefined {
    const foundContext = this.contexts.find((ctx) => {
      console.log(
        '🚀 ~ file: strategyManager.ts:66 ~ ctx.strategy.config.strategyName:',
        ctx.strategy.config.strategyName,
      );
      return ctx.strategy.config.strategyName === strategyName;
    });
    console.log('🚀 ~ file: strategyManager.ts:64 ~ this.contexts:', foundContext);
    return foundContext;
  }

  public getAvailableStrategies(): StrategyManager[] {
    return this.contexts.map((context) => context.strategy);
  }
}
export default StrategyManager;
