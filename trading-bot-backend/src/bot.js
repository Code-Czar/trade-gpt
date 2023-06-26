"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TradingBot = void 0;
const ccxt = __importStar(require("ccxt"));
const technicalindicators_1 = require("technicalindicators");
class TradingBot {
    constructor(exchangeId) {
        this.exchange = new ccxt[exchangeId]();
    }
    fetchOHLCV(symbol, timeframe) {
        return __awaiter(this, void 0, void 0, function* () {
            while (true) {
                try {
                    yield this.exchange.loadMarkets();
                    return this.exchange.fetchOHLCV(symbol, timeframe);
                }
                catch (error) {
                    if (error instanceof ccxt.DDoSProtection) {
                        console.log('Rate limit hit, waiting before retrying...');
                        yield new Promise(resolve => setTimeout(resolve, 1000)); // wait for 1 second
                    }
                    else {
                        throw error; // re-throw the error if it's not a rate limit error
                    }
                }
            }
        });
    }
    calculateBollingerBands(ohlcv) {
        const closeValues = ohlcv.map(x => x[4]);
        return technicalindicators_1.BollingerBands.calculate({ period: 20, values: closeValues, stdDev: 2 });
    }
    calculateRSI(ohlcv) {
        const closeValues = ohlcv.map(x => x[4]);
        return technicalindicators_1.RSI.calculate({ values: closeValues, period: 14 });
    }
    calculateMACD(ohlcv) {
        const closeValues = ohlcv.map(x => x[4]);
        return technicalindicators_1.MACD.calculate({
            values: closeValues,
            fastPeriod: 12,
            slowPeriod: 26,
            signalPeriod: 9,
            SimpleMAOscillator: false,
            SimpleMASignal: false
        });
    }
    calculateVolumes(ohlcv) {
        return ohlcv.map(x => x[5]);
    }
    findLowestSupport(ohlcvs) {
        return __awaiter(this, void 0, void 0, function* () {
            let lowest = ohlcvs[0][3];
            for (let i = 1; i < ohlcvs.length; i++) {
                if (ohlcvs[i][3] < lowest) {
                    lowest = ohlcvs[i][3];
                }
            }
            return [0, 0, 0, lowest];
        });
    }
    findSupport(ohlcvs, tolerance = 0.0001) {
        return __awaiter(this, void 0, void 0, function* () {
            const supports = [];
            let potentialSupport = null;
            ohlcvs.forEach((ohlc, index) => {
                if (index === 0)
                    return;
                const prevOhlc = ohlcvs[index - 1];
                // If we're not currently tracking a support level
                if (!potentialSupport) {
                    // And the current price is lower than the previous one, start tracking a potential support level
                    if (ohlc.low < prevOhlc.low) {
                        potentialSupport = {
                            level: ohlc.low,
                            hits: [],
                            start: prevOhlc.time,
                            end: null
                        };
                    }
                }
                else {
                    // If the current price is lower than the potential support level, update it
                    if (ohlc.low < potentialSupport.level) {
                        potentialSupport.level = ohlc.low;
                        potentialSupport.end = ohlc.time;
                    }
                    else {
                        // If the price is within the tolerance of the potential support level, register a hit
                        if (ohlc.low <= potentialSupport.level * (1 + tolerance)) {
                            potentialSupport.hits.push(ohlc);
                        }
                        else if (ohlc.low > potentialSupport.level * (1 + tolerance)) {
                            // If the price rises above the tolerance of the potential support level, finish tracking it
                            if (potentialSupport.hits.length > 1) {
                                supports.push(potentialSupport);
                            }
                            potentialSupport = null;
                        }
                    }
                }
            });
            return supports;
        });
    }
    findTopResistance(ohlcvs) {
        return __awaiter(this, void 0, void 0, function* () {
            let highest = ohlcvs[0][2];
            for (let i = 1; i < ohlcvs.length; i++) {
                if (ohlcvs[i][2] > highest) {
                    highest = ohlcvs[i][2];
                }
            }
            return [0, 0, 0, highest];
        });
    }
    findResistance(ohlcvs, tolerance = 0.0001) {
        return __awaiter(this, void 0, void 0, function* () {
            const resistances = [];
            let potentialResistance = null;
            ohlcvs.forEach((ohlc, index) => {
                if (index === 0)
                    return;
                const prevOhlc = ohlcvs[index - 1];
                // If we're not currently tracking a resistance level
                if (!potentialResistance) {
                    // And the current price is higher than the previous one, start tracking a potential resistance level
                    if (ohlc.high > prevOhlc.high) {
                        potentialResistance = {
                            level: ohlc.high,
                            hits: [],
                            start: prevOhlc.time,
                            end: null
                        };
                    }
                }
                else {
                    // If the current price is higher than the potential resistance level, update it
                    if (ohlc.high > potentialResistance.level) {
                        potentialResistance.level = ohlc.high;
                        potentialResistance.end = ohlc.time;
                    }
                    else {
                        // If the price is within the tolerance of the potential resistance level, register a hit
                        if (ohlc.high >= potentialResistance.level * (1 - tolerance)) {
                            potentialResistance.hits.push(ohlc);
                        }
                        else if (ohlc.high < potentialResistance.level * (1 - tolerance)) {
                            // If the price drops below the tolerance of the potential resistance level, finish tracking it
                            if (potentialResistance.hits.length > 1) {
                                resistances.push(potentialResistance);
                            }
                            potentialResistance = null;
                        }
                    }
                }
            });
            return resistances;
        });
    }
}
exports.TradingBot = TradingBot;
