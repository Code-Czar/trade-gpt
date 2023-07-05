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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BybitManager = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
const crypto = __importStar(require("crypto"));
const { RestClientV5 } = require('bybit-api');
dotenv_1.default.config();
class BybitManager {
    constructor() {
        if (process.env.BYBIT_TEST_MODE === 'true') {
            this.client = new RestClientV5({
                testnet: true,
                key: process.env.BYBIT_T_KEY,
                secret: process.env.BYBIT_T_SECRET
            });
        }
        else {
            this.client = new RestClientV5({
                testnet: false,
                key: process.env.BYBIT_P_KEY,
                secret: process.env.BYBIT_P_SECRET
            });
        }
    }
    createOrder(side, symbol, price, quantity, position) {
        return __awaiter(this, void 0, void 0, function* () {
            // const pair = symbol.split('-');
            symbol = symbol.replace('-', '');
            // const bybitPair = []
            // // Put USDT first
            // if (pair[0] !== 'USDT') {
            //     bybitPair.push(pair[1])
            //     bybitPair.push(pair[0])
            // }
            // else {
            //     bybitPair.push(pair[0])
            //     bybitPair.push(pair[1])
            // }
            // symbol = bybitPair.join('')
            quantity = quantity.toString();
            const params = {
                category: 'spot',
                symbol: 'USDTETH',
                side: 'Sell',
                orderType: 'Market',
                qty: '10',
                // price: '15600',
                orderLinkId: position.id,
                isLeverage: 0,
                // orderFilter: 'Order',
            };
            const params2 = {
                category: 'spot',
                symbol: symbol,
                side: side,
                orderType: 'Market',
                qty: quantity,
                // price: '15600',
                orderLinkId: position.id,
                isLeverage: 0,
            };
            console.log("🚀 ~ file: ByBitManager.ts:50 ~ BybitManager ~ createOrder ~ params:", params, params2);
            this.client
                .submitOrder(params2)
                .then((response) => {
                console.log("🚀 ~ file: ByBitManager.ts:102 ~ BybitManager ~ .then ~ response:", response);
                console.log(response);
            })
                .catch((error) => {
                console.error(error);
            });
            // return response.result.orderId;
        });
    }
    generateSignature(params, apiSecret) {
        const orderedParams = Object.keys(params).sort().reduce((obj, key) => {
            obj[key] = params[key];
            return obj;
        }, {});
        let rawSignature = '';
        for (let key in orderedParams) {
            rawSignature += key + '=' + orderedParams[key] + '&';
        }
        rawSignature = rawSignature.slice(0, -1);
        return crypto.createHmac('sha256', apiSecret).update(rawSignature).digest('hex');
    }
}
exports.BybitManager = BybitManager;
