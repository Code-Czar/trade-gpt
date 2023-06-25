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
            yield this.exchange.loadMarkets();
            return this.exchange.fetchOHLCV(symbol, timeframe);
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
    findSupport(ohlcvs) {
        return __awaiter(this, void 0, void 0, function* () {
            let lowest = ohlcvs[0][3];
            for (let i = 1; i < ohlcvs.length; i++) {
                if (ohlcvs[i][3] < lowest) {
                    lowest = ohlcvs[i][3];
                }
            }
            return lowest;
        });
    }
    findResistance(ohlcvs) {
        return __awaiter(this, void 0, void 0, function* () {
            let highest = ohlcvs[0][2];
            for (let i = 1; i < ohlcvs.length; i++) {
                if (ohlcvs[i][2] > highest) {
                    highest = ohlcvs[i][2];
                }
            }
            return highest;
        });
    }
}
exports.TradingBot = TradingBot;
