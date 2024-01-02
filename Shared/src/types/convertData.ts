// Explicitly type the parameters and return types
import moment from 'moment';

export const sortDataAscending = (data) => {
  return data.sort((a, b) => a[0] - b[0]);
};

export const readableTimestamp = (timestamp) => {
  return moment(timestamp).format('DD-MM-YYYY HH:mm');
};

export const convertTimeFrameToByBitStandard = (interval: string) => {
  if (interval.includes('m')) {
    return interval.replace('m', '');
  }
  if (interval === '1h') {
    return '60';
  }
  if (interval.includes('d')) {
    return 'D';
  }
  if (interval.includes('M')) {
    return 'M';
  }
  if (interval.includes('W')) {
    return 'W';
  }
  // return interval
};
export const convertTimeframeToMs = (timeframe: string): number => {
  const unit = timeframe.charAt(timeframe.length - 1);
  const value = parseInt(timeframe.slice(0, -1));

  switch (unit) {
    case 'm':
      return value * 60 * 1000;
    case 'h':
      return value * 60 * 60 * 1000;
    case 'd':
      return value * 24 * 60 * 60 * 1000;
    // Add more units as needed
    default:
      throw new Error(`Unknown timeframe unit: ${unit}`);
  }
};
export const getStartOfTimeframe = (timestamp, timeframeMs) => {
  return timestamp - (timestamp % timeframeMs);
};

export const convertBybitTimeFrameToLocal = (interval: string) => {
  if (interval === '1') {
    return '1m';
  }
  if (interval === '3') {
    return '3m';
  }
  if (interval === '5') {
    return '5m';
  }
  if (interval === '15') {
    return '15m';
  }
  if (interval === '30') {
    return '30m';
  }
  if (interval === '60') {
    return '1h';
  }
  if (interval === 'D') {
    return '1d';
  }
  if (interval === 'W') {
    return 'W';
  }
  if (interval === 'M') {
    return 'M';
  }
};

export function mergeOHLCVData(overlappingData, newData, timeframeMs) {
  // Sort both arrays in ascending order of timestamp
  const sortedOverlappingData = overlappingData; //.sort((a, b) => b.time - a.time);
  const sortedNewData = newData.sort((a, b) => a.time - b.time);

  if (!sortedOverlappingData.length) return sortedNewData;
  if (!sortedNewData.length) return sortedOverlappingData;

  const mergedData = [...sortedOverlappingData];
  const lastTimestampInOverlap = sortedOverlappingData[sortedOverlappingData.length - 1].time;

  sortedNewData.forEach((dataPoint, index) => {
    if (index === 0 && dataPoint.time === lastTimestampInOverlap) {
      // Skip duplicate at the boundary
      return;
    }

    if (index > 0) {
      const prevDataPoint = sortedNewData[index - 1];
      if (dataPoint.time - prevDataPoint.time > timeframeMs) {
        console.error(`Gap detected in OHLCV data between ${prevDataPoint.time} and ${dataPoint.time}`);
      }
    }

    mergedData.push(dataPoint);
  });

  return mergedData;
}

// Explicitly type the parameters and return types
export const objectToObject = (obj: { [key: string]: any }): { [key: string]: any } => {
  const result: { [key: string]: any } = {};
  for (const key in obj) {
    const value = obj[key];
    if (value instanceof Map) {
      result[key] = mapToObject(value);
    } else if (Array.isArray(value)) {
      result[key] = value.map((val) => (val instanceof Map ? mapToObject(val) : val));
    } else if (typeof value === 'object' && value !== null) {
      result[key] = objectToObject(value);
    } else {
      result[key] = value;
    }
  }
  return result;
};

export const mapToObject = (map: Map<any, any>): { [key: string]: any } => {
  const obj: { [key: string]: any } = {};
  map.forEach((value, key) => {
    let keyName = key;
    if (typeof key === 'object') {
      keyName = key.name;
    }
    if (value instanceof Map) {
      obj[keyName] = mapToObject(value);
    } else if (Array.isArray(value)) {
      obj[keyName] = value.map((val) => (val instanceof Map ? mapToObject(val) : val));
    } else if (typeof value === 'object' && value !== null) {
      obj[keyName] = objectToObject(value);
    } else {
      obj[keyName] = value;
    }
  });
  return obj;
};

export const stringifyMap = async (nestedMap: Map<string, any>) => {
  const obj = mapToObject(nestedMap);
  const jsonString = JSON.stringify(obj);
  return obj;
};

export const convertPairToJSON = async (pair: any) => {
  try {
    const keys = Object.keys(pair);
    const obj = {};
    keys.forEach((key) => {
      const value = pair[key];
      if (value instanceof Map) {
        obj[key] = mapToObject(value);
      } else if (Array.isArray(value)) {
        obj[key] = value.map((val) => (val instanceof Map ? mapToObject(val) : val));
      } else if (typeof value === 'object' && value !== null) {
        obj[key] = objectToObject(value);
      } else {
        obj[key] = value;
      }
    });
    return obj;
  } catch (error) {
    console.error('🚀 ~ file: convertData.ts:136 ~ convertPairToJSON ~ error:', error);
    return {};
  }
};

export const mergeObjects = (obj1, obj2) => {
  // Check if both inputs are objects
  if (typeof obj1 !== 'object' || typeof obj2 !== 'object') {
    return obj2; // If not, return obj2 (overwrites obj1)
  }

  const result = { ...obj1 }; // Create a shallow copy of obj1

  for (const key in obj2) {
    if (obj2.hasOwnProperty(key)) {
      if (typeof obj2[key] === 'object') {
        // If the value is an object, recursively merge it
        result[key] = mergeObjects(result[key], obj2[key]);
      } else {
        // Otherwise, assign the value from obj2 to the result
        result[key] = obj2[key];
      }
    }
  }

  return result;
};
export function deleteNestedKey(obj, keyToDelete) {
  // Helper function to check if an object is empty
  function isEmptyObject(o) {
    return Object.keys(o).length === 0 && o.constructor === Object;
  }

  for (let key in obj) {
    if (key === keyToDelete) {
      delete obj[key];
    } else if (typeof obj[key] === 'object' && obj[key] !== null) {
      deleteNestedKey(obj[key], keyToDelete);
      // After deleting the key, check if the parent object is now empty
      if (isEmptyObject(obj[key])) {
        delete obj[key];
      }
    }
  }
}
export function ensureNestedKeysExist(obj, keys) {
  let current = obj;

  for (const key of keys) {
    if (!current[key]) {
      current[key] = {};
    }
    current = current[key];
  }
}

export default {
  readableTimestamp,
  mapToObject,
  stringifyMap,
  convertPairToJSON,
  convertTimeFrameToByBitStandard,
  convertBybitTimeFrameToLocal,
  sortDataAscending,
  convertTimeframeToMs,
  getStartOfTimeframe,
  mergeObjects,
  deleteNestedKey,
  ensureNestedKeysExist,
  mergeOHLCVData,
};
module.exports = {
  readableTimestamp,
  mapToObject,
  stringifyMap,
  convertPairToJSON,
  convertTimeFrameToByBitStandard,
  convertBybitTimeFrameToLocal,
  sortDataAscending,
  convertTimeframeToMs,
  getStartOfTimeframe,
  mergeObjects,
  deleteNestedKey,
  ensureNestedKeysExist,
  mergeOHLCVData,
};
