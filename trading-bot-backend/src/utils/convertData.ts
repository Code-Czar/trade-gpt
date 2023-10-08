// Explicitly type the parameters and return types


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

};

export default {
    mapToObject,
    stringifyMap,
    convertPairToJSON
}
module.exports = {
    mapToObject,
    stringifyMap,
    convertPairToJSON
}


