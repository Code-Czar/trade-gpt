import * as ccxt from 'ccxt';
import * as cliChart from 'cli-chart';


export class TradingBot {
    private exchange: ccxt.Exchange;

    constructor(exchangeId: string) {
        this.exchange = new (ccxt as any)[exchangeId]();
    }

    async fetchOHLCV(symbol: string, timeframe: string) {
        await this.exchange.loadMarkets();
        return this.exchange.fetchOHLCV(symbol, timeframe);
    }

}
