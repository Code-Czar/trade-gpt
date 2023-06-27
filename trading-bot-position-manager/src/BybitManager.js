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
const node_fetch_1 = __importDefault(require("node-fetch"));
const dotenv_1 = __importDefault(require("dotenv"));
const crypto = __importStar(require("crypto"));
dotenv_1.default.config();
class BybitManager {
    constructor() {
        this.bybitApiKey = process.env.BYBIT_API_KEY;
        this.bybitApiSecret = process.env.BYBIT_API_SECRET;
        if (process.env.BYBIT_TEST_MODE === 'true')
            this.bybitUrl = process.env.BYBIT_PROD_URL; // Use 'https://api-testnet.bybit.com' for testnet
        else
            this.bybitUrl = process.env.BYBIT_TEST_URL;
    }
    createOrder(side, symbol, price, quantity) {
        return __awaiter(this, void 0, void 0, function* () {
            const path = '/v2/private/order/create';
            const params = {
                api_key: this.bybitApiKey,
                side: side,
                symbol: symbol,
                order_type: 'Limit',
                qty: quantity,
                price: price,
                time_in_force: 'GoodTillCancel',
                timestamp: Date.now()
            };
            params['sign'] = this.generateSignature(params, this.bybitApiSecret);
            const response = yield (0, node_fetch_1.default)(this.bybitUrl + path, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(params),
            });
            const data = yield response.json();
            return data.result.order_id;
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
