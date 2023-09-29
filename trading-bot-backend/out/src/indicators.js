"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateRSI = exports.calculateMACD = exports.calculateBollingerBands = void 0;
const technicalindicators_1 = require("technicalindicators");
function calculateBollingerBands(values, period = 14, stdDev = 2) {
    return technicalindicators_1.BollingerBands.calculate({ period, stdDev, values });
}
exports.calculateBollingerBands = calculateBollingerBands;
function calculateMACD(values, fastPeriod = 12, slowPeriod = 26, signalPeriod = 9) {
    //@ts-ignore
    return technicalindicators_1.MACD.calculate({ fastPeriod, slowPeriod, signalPeriod, values });
}
exports.calculateMACD = calculateMACD;
function calculateRSI(values, period = 14) {
    return technicalindicators_1.RSI.calculate({ period, values });
}
exports.calculateRSI = calculateRSI;
//# sourceMappingURL=indicators.js.map