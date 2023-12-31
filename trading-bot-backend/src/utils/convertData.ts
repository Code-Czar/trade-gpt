// Explicitly type the parameters and return types
export const sortDataAscending = (data) => {
    return data.sort((a, b) => a[0] - b[0]);
}

export const convertTimeFrameToByBitStandard = (interval: string) => {
    if (interval.includes('m')) {
        return interval.replace('m', '')
    }
    if (interval === "1h") {
        return '60'
    }
    if (interval.includes('d')) {
        return 'D'
    }
    if (interval.includes('M')) {
        return 'M'
    }
    if (interval.includes('W')) {
        return 'W'
    }
    // return interval

};
export const convertTimeframeToMs = (timeframe: string): number => {
    const unit = timeframe.charAt(timeframe.length - 1);
    const value = parseInt(timeframe.slice(0, -1));

    switch (unit) {
        case 'm': return value * 60 * 1000;
        case 'h': return value * 60 * 60 * 1000;
        case 'd': return value * 24 * 60 * 60 * 1000;
        case 'W': return value * 7 * 24 * 60 * 60 * 1000;
        case 'M': return value * 30 * 24 * 60 * 60 * 1000;
        // Add more units as needed
        default: throw new Error(`Unknown timeframe unit: ${unit}`);
    }
}
export const getStartOfTimeframe = (timestamp, timeframeMs) => {
    return timestamp - (timestamp % timeframeMs);
}

export const convertBybitTimeFrameToLocal = (interval: string) => {
    if (interval === '1') {
        return '1m'
    }
    if (interval === '3') {
        return '3m'
    }
    if (interval === '5') {
        return '5m'
    }
    if (interval === '15') {
        return '15m'
    }
    if (interval === '30') {
        return '30m'
    }
    if (interval === '60') {
        return '1h'
    }
    if (interval === 'D') {
        return '1d'
    }
    if (interval === 'W') {
        return 'W'
    }
    if (interval === 'M') {
        return 'M'
    }

};

// Explicitly type the parameters and return types
export const objectToObject = (obj: { [key: string]: any }): { [key: string]: any } => {
    const result: { [key: string]: any } = {};
    for (const key in obj) {
        const value = obj[key];
        if (value instanceof Map) {
            result[key] = mapToObject(value);
        } else if (Array.isArray(value)) {
            result[key] = value.map(val => (val instanceof Map ? mapToObject(val) : val));
        } else if (typeof value === 'object' && value !== null) {
            result[key] = objectToObject(value);
        } else {
            result[key] = value;
        }
    }
    return result;
}


export const mapToObject = (map: Map<any, any>): { [key: string]: any } => {
    const obj: { [key: string]: any } = {};
    map.forEach((value, key) => {
        let keyName = key;
        if (typeof key === 'object') {
            keyName = key.name
        }
        if (value instanceof Map) {
            obj[keyName] = mapToObject(value);
        } else if (Array.isArray(value)) {
            obj[keyName] = value.map(val => (val instanceof Map ? mapToObject(val) : val));
        } else if (typeof value === 'object' && value !== null) {
            obj[keyName] = objectToObject(value);
        } else {
            obj[keyName] = value;
        }
    });
    return obj;
}

export const stringifyMap = async (nestedMap: Map<string, any>) => {
    const obj = mapToObject(nestedMap);
    const jsonString = JSON.stringify(obj);
    return obj;
}

export const convertPairToJSON = async (pair: any) => {
    try {

        const keys = Object.keys(pair);
        const obj = {};
        keys.forEach((key) => {
            const value = pair[key];
            if (value instanceof Map) {
                obj[key] = mapToObject(value);
            } else if (Array.isArray(value)) {
                obj[key] = value.map(val => (val instanceof Map ? mapToObject(val) : val));
            } else if (typeof value === 'object' && value !== null) {
                obj[key] = objectToObject(value);
            } else {
                obj[key] = value;
            }
        });
        return obj;
    } catch (error) {
        console.error("🚀 ~ file: convertData.ts:136 ~ convertPairToJSON ~ error:", error)
        return {}
    }

};

export default {
    mapToObject,
    stringifyMap,
    convertPairToJSON,
    convertTimeFrameToByBitStandard,
    convertBybitTimeFrameToLocal,
    sortDataAscending,
    convertTimeframeToMs,
    getStartOfTimeframe
}
module.exports = {
    mapToObject,
    stringifyMap,
    convertPairToJSON,
    convertTimeFrameToByBitStandard,
    convertBybitTimeFrameToLocal,
    sortDataAscending,
    convertTimeframeToMs,
    getStartOfTimeframe
}


