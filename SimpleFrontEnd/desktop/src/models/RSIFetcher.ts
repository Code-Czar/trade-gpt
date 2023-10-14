import axios from 'axios';
import { BACKEND_URL } from './consts'


export async function get_bybit_pairs_with_leverage(): Promise<BasicObject[]> {
    const url = `${BACKEND_URL}/api/symbols/leverage`;
    const response = await fetch(url);
    return response.json();
}

export async function getBinanceHistoricalData(pair: string, interval: string, limit = 200): Promise<number[]> {
    const url = `${BACKEND_URL}/api/historical/${pair}/${interval}/${limit}`;
    const response = await fetch(url);
    return response.json();
}

export async function calculate_rsi(pair: string, interval: string, period = 14): Promise<number> {
    const prices = await getBinanceHistoricalData(pair, interval, period + 1);
    return calculate_rsi_from_prices(prices, period);
}

export async function calculate_rsi_bulk(symbols: string[], timeframes: string[]): Promise<any> {
    const url = `${BACKEND_URL}/api/rsi/bulk`;
    const response = await axios.post(url, { symbols, timeframes });
    return response.data;
}

export function calculate_rsi_from_prices(prices: number[], period = 14): number {
    if (prices.length < period + 1) {
        throw new Error("Not enough data to compute RSI");
    }

    const deltas = prices.slice(1).map((price, i) => price - prices[i]);
    const gains = deltas.map(delta => Math.max(delta, 0));
    const losses = deltas.map(delta => Math.abs(Math.min(delta, 0)));  // use abs to get positive loss values

    let avg_gain = gains.slice(0, period).reduce((a, b) => a + b) / period;
    let avg_loss = losses.slice(0, period).reduce((a, b) => a + b) / period;

    for (let idx = period; idx < prices.length - 1; idx++) {
        avg_gain = ((avg_gain * (period - 1)) + gains[idx]) / period;
        avg_loss = ((avg_loss * (period - 1)) + losses[idx]) / period;
    }

    if (avg_loss === 0) {
        return 100;
    }
    const rs = avg_gain / avg_loss;
    return 100 - (100 / (1 + rs));
}

export function calculate_rsi_series(prices: number[], period = 14): number[] {
    return prices.map((_, idx) => {
        const priceSlice = prices.slice(0, idx + 1);
        return calculate_rsi_from_prices(priceSlice, period);
    });
}


export default {
    get_bybit_pairs_with_leverage,
    getBinanceHistoricalData,
    calculate_rsi,
    calculate_rsi_series,
    calculate_rsi_bulk
}
