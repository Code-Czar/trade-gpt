// declare global {
export const PAIR_TYPES = {
  leveragePairs: 'leveragePairs',
  forexPairs: 'forexPairs',
  cryptoPairs: 'cryptoPairs',
};
export type OHLCV = Array<[timestamp: number, open: number, high: number, low: number, close: number, volume: number]>;
export interface TimeframeData {
  ohlcvs?: OHLCV[];
  ema?: {
    ema7?: number;
    ema14?: number;
    ema28?: number;
    ema100?: number;
    ema200?: number;
  };
  rsi?: {
    rsi14?: number;
  };
  boillingerBands?: {
    upperBand?: number;
    lowerBand?: number;
    middleBand?: number;
  };
}

export interface StorePair {
  [timeframe: string]: TimeframeData;
}
export interface LeveragePairDetails {
  name: string;
  alias: string;
  status: string; // You might want to use an enum if there are specific, known statuses
  base_currency: string;
  quote_currency: string;
  price_scale: number;
  taker_fee: string; // Consider using number if these represent numerical values
  maker_fee: string; // Consider using number
  funding_interval: number;
  leverage_filter: {
    min_leverage: number;
    max_leverage: number;
    leverage_step: string; // Consider using number if this represents a numerical value
  };
  price_filter: {
    min_price: string; // Consider using number
    max_price: string; // Consider using number
    tick_size: string; // Consider using number
  };
  lot_size_filter: {
    max_trading_qty: number;
    min_trading_qty: number;
    qty_step: number;
    post_only_max_trading_qty: string; // Consider using number
  };
}

export interface LeveragePairBase {
  symbolDetails?: LeveragePairDetails;
}

export type LeveragePair = StorePair & LeveragePairBase;
// }
