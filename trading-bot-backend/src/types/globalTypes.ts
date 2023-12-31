// globalTypes.ts
import { StorePair, LeveragePair, OHLCV } from 'trading-shared' // Import from the shared library

export { StorePair, LeveragePair, OHLCV } // Re-export StorePair

declare global {
  type DataStore = Map

  type Object = {
    [key: string]: any
  }
  type BasicObject = Object

  interface SymbolDetails {
    name: string
    // ... other properties of symbolDetails if any
  }

  type OHLCVData = [
    timestamp: number,
    open: number,
    high: number,
    low: number,
    close: number,
    volumes: number,
  ]

  type InfluxDataPoint = {
    timestamp: number
    open: number
    high: number
    low: number
    close: number
    volumes: number

    rsi?: number
    ema7?: number
    ema14?: number
    ema28?: number

    bbLow?: number
    bbMid?: number
    bbUp?: number

    macdData?: number
    macdHist?: number
    macdSignal?: number

    timeframe?: string
    pairName?: string
  }
}

export default {}
