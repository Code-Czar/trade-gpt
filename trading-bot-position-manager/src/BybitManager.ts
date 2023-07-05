import fetch from 'node-fetch';
import dotenv from 'dotenv';
import * as crypto from 'crypto';
const { RestClientV5 } = require('bybit-api');


dotenv.config();

export class BybitManager {
    private bybitApiKey: string;
    private bybitApiSecret: string;
    private bybitUrl: string;
    private client: any;

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


    async createOrder(side: string, symbol: string, price: number, quantity: number, position: Position) {
        symbol = symbol.replace('-', '');




        this.client
            .submitOrder({
                category: 'spot',
                symbol: 'USDTETH',
                side: 'Sell',
                orderType: 'Market',
                qty: '10',
                // price: '15600',
                orderLinkId: position.id,
                isLeverage: 0,
                // orderFilter: 'Order',
            })
            .then((response) => {
                console.log("🚀 ~ file: ByBitManager.ts:102 ~ BybitManager ~ .then ~ response:", response)
                console.log(response);
            })
            .catch((error) => {
                console.error(error);
            });


        // return response.result.orderId;

    }

    generateSignature(params, apiSecret) {
        const orderedParams = Object.keys(params).sort().reduce(
            (obj, key) => {
                obj[key] = params[key];
                return obj;
            },
            {}
        );

        let rawSignature = '';
        for (let key in orderedParams) {
            rawSignature += key + '=' + orderedParams[key] + '&';
        }
        rawSignature = rawSignature.slice(0, -1);

        return crypto.createHmac('sha256', apiSecret).update(rawSignature).digest('hex');
    }
}
