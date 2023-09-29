// Explicitly type the parameters and return types
function mapToObject(map: Map<any, any>): { [key: string]: any } {
    const obj: { [key: string]: any } = {};
    map.forEach((value, key) => {
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
}

// Explicitly type the parameters and return types
function objectToObject(obj: { [key: string]: any }): { [key: string]: any } {
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




const stringifyMap = async (nestedMap: Map<string, any>) => {
    const obj = mapToObject(nestedMap);
    const jsonString = JSON.stringify(obj);

    console.log(jsonString);
}

export default {
    mapToObject,
    stringifyMap
}


