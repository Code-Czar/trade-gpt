import { BollingerBands, MACD, RSI } from 'technicalindicators';

export function calculateBollingerBands(values: number[], period = 14, stdDev = 2) {
    return BollingerBands.calculate({ period, stdDev, values });
}

export function calculateMACD(values: number[], fastPeriod = 12, slowPeriod = 26, signalPeriod = 9) {
    //@ts-ignore
    return MACD.calculate({ fastPeriod, slowPeriod, signalPeriod, values });
}

export function calculateRSI(values: number[], period = 14) {
    return RSI.calculate({ period, values });
}
