import { PROJECT_URLS, BACKEND_ENDPOINTS } from 'trading-shared';

const timeframes = ['1d', '1h', '5m', '1m'];


export const getLeveragePairsFromBackend = async () => {
    let leveragePairs = []
    const pairsResult = await fetch(PROJECT_URLS.BACKEND_URL + BACKEND_ENDPOINTS.LEVERAGE_ENDPOINTS.getLeverageSymbols);
    const pairs = await pairsResult.json();
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