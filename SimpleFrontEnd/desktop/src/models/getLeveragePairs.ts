import { apiConnector, BACKEND_URLS } from 'trading-shared';

const timeframes = ['1d', '1h', '5m', '1m'];


export const getLeveragePairsFromBackend = async () => {
    let leveragePairs = []
    const pairsResult = await apiConnector.get(BACKEND_URLS.LEVERAGE_URLS.getLeverageSymbols);
    const pairs = await pairsResult.data;
    leveragePairs = pairs.map(pair => ({
        ...pair,
        timeframeSelection: timeframes.reduce((acc, tf) => ({ ...acc, [tf]: false }), {})
    }));
    return leveragePairs;
};

export const getLeveragePairNames = async () => {
    const pairs = await getLeveragePairsFromBackend();
    return pairs.map((pair) => `${pair.base_currency}/${pair.quote_currency}`)

}