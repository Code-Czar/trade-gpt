import axios from 'axios';

export async function get_bybit_pairs_with_leverage(): Promise<string[]> {
    const url = "https://api.bybit.com/v2/public/symbols";
    const response = await axios.get(url);
    const data = response.data;

    const pairs_with_leverage: string[] = [];

    if (data && data.result) {
        for (const item of data.result) {
            if (item.leverage_filter && item.leverage_filter.max_leverage) {
                pairs_with_leverage.push(item.name);
            }
        }
    }

    return pairs_with_leverage;
}

export async function get_historical_data(pair: string, interval: string, limit = 200): Promise<number[]> {
    const url = `https://api.binance.com/api/v3/klines?symbol=${pair}&interval=${interval}&limit=${limit}`;
    const response = await axios.get(url);
    const data = response.data;

    const closing_prices: number[] = data.map(item => parseFloat(item[4]));
    return closing_prices;
}
export function calculate_rsi(prices: number[], period = 14): number {
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




// export function calculate_rsi(prices: number[]): number {
//     const deltas = prices.slice(1).map((price, i) => price - prices[i]);
//     const gains = deltas.filter(delta => delta > 0);
//     const losses = deltas.filter(delta => delta < 0).map(loss => -loss);

//     const avg_gain = (gains.length > 0) ? (gains.reduce((a, b) => a + b) / gains.length) : 0;
//     const avg_loss = (losses.length > 0) ? (losses.reduce((a, b) => a + b) / losses.length) : 0;

//     if (avg_loss === 0) return 100;
//     const rs = avg_gain / avg_loss;
//     return 100 - (100 / (1 + rs));
// }

export function calculate_rsi_series(prices: number[], period = 14): number[] {
    if (prices.length < period + 1) throw new Error("Not enough data to compute RSI series");

    const deltas = prices.slice(1).map((price, i) => price - prices[i]);
    const gains = deltas.map(delta => Math.max(delta, 0));
    const losses = deltas.map(delta => Math.max(-delta, 0));

    let avg_gain = gains.slice(0, period).reduce((a, b) => a + b) / period;
    let avg_loss = losses.slice(0, period).reduce((a, b) => a + b) / period;

    const rsis: number[] = [];

    for (let idx = period; idx < prices.length - 1; idx++) {
        avg_gain = ((avg_gain * (period - 1)) + gains[idx]) / period;
        avg_loss = ((avg_loss * (period - 1)) + losses[idx]) / period;

        if (avg_loss === 0) {
            rsis.push(100);
        } else {
            const rs = avg_gain / avg_loss;
            rsis.push(100 - (100 / (1 + rs)));
        }
    }

    return rsis;
}

export default {

    get_bybit_pairs_with_leverage,
    get_historical_data,
    calculate_rsi,
    calculate_rsi_series
}
