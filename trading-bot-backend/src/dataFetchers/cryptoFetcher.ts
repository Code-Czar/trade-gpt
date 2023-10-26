const axios = require('axios');

const bybitSymbolsEndpoint = 'https://api.bybit.com/v2/public/symbols'




export const getBybitPairsWithLeverage = async () => {
    const url = bybitSymbolsEndpoint;
    const response = await axios.get(url);
    const data = response.data;

    const pairs_with_leverage: BasicObject[] = [];

    if (data && data.result) {
        for (const item of data.result as Array<BasicObject>) {
            if (item.leverage_filter && item.leverage_filter.max_leverage) {
                pairs_with_leverage.push(item);
            }
        }
    }

    return pairs_with_leverage;
};




export default {
    getBybitPairsWithLeverage,

}