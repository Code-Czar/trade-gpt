import { Point } from '@influxdata/influxdb-client';

const fs = require('fs');

const findValue = (inputArray, timestamp, singleValue = true) => {
  if (singleValue) {
    return inputArray?.find((item) => item.time === timestamp)?.value;
  } else {
    return inputArray?.find((item) => item.time === timestamp);
  }
};

const addFieldsToPoint = (data, pairName, timeframe) => {
  let point = new Point('pair_data')
    .tag('pair', pairName)
    .tag('timeframe', timeframe)
    .timestamp(new Date(data.time))
    .floatField('open', data.open)
    .floatField('high', data.high)
    .floatField('low', data.low)
    .floatField('close', data.close)
    .intField('volume', data.volume);

  ['ema', 'rsi', 'sma', 'ma'].forEach((indicatorType) => {
    if (data[indicatorType]) {
      Object.entries(data[indicatorType]).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          point.floatField(key, value);
        }
      });
    }
  });

  return point;
};

export const convertPairToPointArray = async (inputPair) => {
  const points: Array<Point> = [];

  Object.keys(inputPair.data).forEach((timeframe) => {
    inputPair.data[timeframe].forEach((data) => {
      points.push(addFieldsToPoint(data, data.pairName, timeframe));
    });
  });

  return points;
};

export const convertPointArrayToInfluxPoints = async (pointsArray) => {
  const points: Array<Point> = [];

  pointsArray.forEach((data) => {
    points.push(addFieldsToPoint(data, data.pairName, data.timeframe));
  });

  return points;
};

export const reconstructDataStructure = (pairName: string, influxData: any[]): any => {
  const groupedData: { [key: string]: any } = {};

  influxData.forEach((entry) => {
    const timeframe = entry.timeframe;
    if (!groupedData[timeframe]) {
      groupedData[timeframe] = new Map();
    }

    const timestamp = new Date(entry._time).getTime();
    let dataEntry = groupedData[timeframe].get(timestamp) || { timestamp, timeframe, pairName };

    // Aggregate OHLCV and other fields
    if (['open', 'high', 'low', 'close', 'volume'].includes(entry._field)) {
      dataEntry[entry._field] = entry._value;
    }

    // Handle EMA fields
    if (entry._field.startsWith('ema')) {
      dataEntry.ema = dataEntry.ema || {};
      dataEntry.ema[entry._field] = entry._value;
    }

    // Handle RSI fields
    if (entry._field.startsWith('rsi')) {
      dataEntry.rsi = dataEntry.rsi || {};
      dataEntry.rsi[entry._field] = entry._value;
    }

    groupedData[timeframe].set(timestamp, dataEntry);
  });

  let finalDataStructure: { [key: string]: any[] } = {};
  for (let timeframe in groupedData) {
    finalDataStructure[timeframe] = Array.from(groupedData[timeframe].values());
  }

  return { [pairName]: finalDataStructure };
};
