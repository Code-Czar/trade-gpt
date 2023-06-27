import fetch from 'node-fetch';
import dotenv from 'dotenv';
import * as crypto from 'crypto';

dotenv.config();

export class BybitManager {
    private bybitApiKey: string;
    private bybitApiSecret: string;
    private bybitUrl: string;

    constructor() {
        this.bybitApiKey = process.env.BYBIT_API_KEY;
        this.bybitApiSecret = process.env.BYBIT_API_SECRET;
        if (process.env.BYBIT_TEST_MODE === 'true')
            this.bybitUrl = process.env.BYBIT_PROD_URL; // Use 'https://api-testnet.bybit.com' for testnet
        else
            this.bybitUrl = process.env.BYBIT_TEST_URL;
    }

    async createOrder(side: string, symbol: string, price: number, quantity: number) {
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

        const response = await fetch(this.bybitUrl + path, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(params),
        });

        const data = await response.json();
        return data.result.order_id;
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
