import { InfluxDBWrapper, reconstructDataStructure } from 'trading-shared';
import { StrategyManagerController } from './strategyManagerController';

interface DataRequestParams {
  pair: string;
  timeframe: string;
  startDate?: Date;
  endDate?: Date;
  fields?: Array<string>;
  // Add other relevant parameters for data fetching
}

interface CandleData {
  time: Date;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  // Add other relevant candle data fields
}
interface CandleDataIndicator extends CandleData {
  rsi?: Object;
  ma?: Object;
  ema?: Object;
  sma?: Object;
  // Add other relevant candle data fields
}

interface DataFetchResults {
  [key: string]: Array<CandleDataIndicator>;
}

export class DataController {
  private readonly influxDBWrapper: InfluxDBWrapper;
  private strategyManagerController: StrategyManagerController;

  constructor(strategyManagerController: StrategyManagerController, influxDB: InfluxDBWrapper | null = null) {
    this.strategyManagerController = strategyManagerController;

    if (!influxDB) {
      this.influxDBWrapper = new InfluxDBWrapper();
    } else {
      this.influxDBWrapper = influxDB;
    }
  }

  public async fetchData(params: DataRequestParams): Promise<DataFetchResults> {
    const query = this.buildQuery(params);
    const correspondingContext = this.strategyManagerController.getStrategyContext(params.strategyName);
    const pairNames = params.pairs;
    const strategyConfig = correspondingContext.strategy.config;
    const requiredParameters = strategyConfig.parameters;
    const requiredFields = strategyConfig.requiredFields;
    console.log(
      '🚀 ~ file: dataController.ts:42 ~ params:',
      params,
      correspondingContext,
      requiredParameters,
      requiredFields,
    );
    try {
      const pairsResult = {};
      for (const pairName of pairNames) {
        const result = await this.influxDBWrapper.getPairData(
          pairName,
          params.timeRangeStart,
          params.timeRangeStop,
          strategyConfig.timeframes,
          requiredFields,
        );
        console.log('🚀 ~ file: dataController.ts:69 ~ result:', result);
        const reconstructedData = reconstructDataStructure(pairName, result[pairName]);
        console.log('🚀 ~ file: dataController.ts:68 ~ result:', reconstructedData);
        console.log(
          '🚀 ~ file: dataController.ts:68 ~ result:',
          reconstructedData[pairName][strategyConfig.timeframes[0]],
        );
        pairsResult[pairName] = reconstructedData[pairName];
      }
      // Return formatted data
      return pairsResult;
    } catch (error) {
      console.error('Error fetching data from InfluxDB:', error);
      throw error;
    }
  }

  private buildQuery(params: DataRequestParams): string {
    // Build and return InfluxDB query based on the provided params
    // Example: `SELECT * FROM candle_data WHERE pair = '${params.pair}' AND time >= '${params.startDate}' AND time <= '${params.endDate}'`
  }

  private formatData(rawData: CandleData[]): CandleDataIndicator[] {
    // Format and return the data as needed for the trading strategies
    // This might involve normalization, handling missing values, etc.
  }
}
