"use strict";
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
const bot_1 = require("./bot");
const bot = new bot_1.TradingBot('binance');
const symbol = 'BTC/USDT';
const timeframe = '1d'; // 1 day
function startBot() {
    return __awaiter(this, void 0, void 0, function* () {
        // const data = await bot.fetchOHLCV(symbol, timeframe);
        // // console.log(data);
    });
}
startBot().catch(console.error);
