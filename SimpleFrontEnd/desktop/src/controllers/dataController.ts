import { apiConnector } from "trading-shared";
import { RSIFetcher, BACKEND_URL } from "@/models"
import { dataStore } from "@/stores/example-store";


let fetching = false;
export const getPairsDetails = async (refresh = false) => {
    if (dataStore().pairs.size === 0 || refresh) {
        const pairs = await RSIFetcher.get_bybit_pairs_with_leverage();
        dataStore().setPairsDetails(pairs)
    }
    return [...dataStore().pairs.values()].map((pair) => pair.details);
}

export const getRSILastData = async () => {
    const result = [];
    try {
        // console.log("🚀 ~ file: dataController.ts:13 ~ retrieveRSIData ~ dataStore().pairs.values():", dataStore().pairs.values())
        const pairs = [...dataStore().pairs.values()].map((pair) => pair.details);
        // if (storePairs) {
        dataStore().setPairsDetails(pairs);
        // }
        // console.log("Fetched pairs:", pairs);


        const symbols = dataStore().pairs.keys();
        const timeframes = ["1d", "1h", "5m"];


        for (const pair of pairs) {
            const dataEntry = {
                name: pair.name,
                maxLeverage: pair.leverage_filter ? pair.leverage_filter.max_leverage : 0
            };

            let hasRSIValue = false; // Flag to check if the pair has any RSI value

            for (const interval of timeframes) {
                try {
                    const rsi = dataStore().pairs.get(pair.name).rsi[interval].rsi;
                    // console.log("🚀 ~ file: dataController.ts:42 ~ getRSILastData ~ rsi:", rsi)
                    if (rsi) {
                        const rsiValue = rsi[rsi.length - 1]
                        // console.log("🚀 ~ file: dataController.ts:45 ~ getRSILastData ~ rsiValue:", rsiValue)
                        const rsiRounded = parseFloat(rsiValue.toFixed(2))
                        dataEntry[`rsi_${interval}`] = rsiRounded;
                        dataEntry[`maxLeverage`] = pair.leverage_filter.max_leverage;
                        hasRSIValue = true;
                    }
                } catch (error) {
                    // console.error(`Error fetching data for ${pair.name} with interval ${interval}:`, error.message);
                }
            }

            if (hasRSIValue) {
                const existingIndex: number = result.findIndex(p => p.name === pair.name);

                if (existingIndex !== -1) {
                    // If the symbol exists, update the existing entry
                    result[existingIndex] = dataEntry;
                } else {
                    // If the symbol doesn't exist, push a new entry
                    result.push(dataEntry);
                }
            }


        }

    } catch (error) {
        console.error("Error fetching pairs:", error.message);
    }
    return result;
}

export const fetchRSIData = async (addToStore = true) => {
    const data = await getRSILastData();
    if (addToStore) {
        dataStore().setLastRSIData(data);
    }
    return data;
}


export const fetchRSIAndOHLCV = async () => {
    if (fetching) {
        return;
    }
    fetching = true;
    getPairsDetails()

    const result = await apiConnector.get(`${BACKEND_URL}/api/rsi/getValues`)
    let data = (await result.data)
    console.log("🚀 ~ file: dataController.ts:91 ~ fetchRSIAndOHLCV ~ data:", data)
    dataStore().setAllPairs(data)
    data = null;
    fetching = false;

};
export const fetchLastRSI = async () => {
    if (fetching) {
        return;
    }
    fetching = true;


    const result = await apiConnector.get(`${BACKEND_URL}/api/lastRsi/bulk`)
    const data = (await result.data)
    console.log("🚀 ~ file: dataController.ts:91 ~ fetchRSIAndOHLCV ~ data:", data);

    fetching = false;
    return data

};

export const fetchSymbolData = async (symbolName: string) => {

    const result = await apiConnector.get(`${BACKEND_URL}/api/getSymbolValues/${symbolName}`)
    const data = (await result.data)
    return data
};


export default {
    fetchRSIData,
    fetchLastRSI,
    fetchRSIAndOHLCV,
    getRSILastData,
    fetchSymbolData
}