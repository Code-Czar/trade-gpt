import { SMA, EMA, RSI, MACD } from 'technicalindicators';

export function mergeIndicatorData(formattedData, indicatorData) {
  return formattedData.map((dataPoint, index) => {
    const indicatorValue = indicatorData[index];
    if (indicatorValue && dataPoint.time === indicatorValue.time) {
      return { ...dataPoint, ...indicatorValue };
    }
    return dataPoint;
  });
}

const sma = (arr, windowSize) => {
  const result: any = [];
  for (let i = windowSize - 1; i < arr.length; i++) {
    const window = arr.slice(i - windowSize + 1, i + 1);
    const average = window.reduce((sum, num) => sum + num, 0) / windowSize;
    result.push(average);
  }
  return result;
};

const standardDeviation = (arr, windowSize, smaValues) => {
  const result: any = [];
  for (let i = windowSize - 1; i < arr.length; i++) {
    const window = arr.slice(i - windowSize + 1, i + 1);
    const variance =
      window.reduce((sum, num) => sum + Math.pow(num - smaValues[i - windowSize + 1], 2), 0) / windowSize;
    result.push(Math.sqrt(variance));
  }
  return result;
};

export const calculateBollingerBands = (formattedData, timePeriod = 20) => {
  const closePrices = formattedData.map((datum) => datum.close);
  const sma20 = sma(closePrices, timePeriod);
  const stdDev20 = standardDeviation(closePrices, timePeriod, sma20);

  const upperBand = sma20.map((value, index) => value + 2 * stdDev20[index]);
  const middleBand = sma20;
  const lowerBand = sma20.map((value, index) => value - 2 * stdDev20[index]);

  return formattedData.map((data, index) => {
    if (index >= timePeriod - 1) {
      return {
        time: data.time,
        bollingerBands: {
          upperBand: upperBand[index - timePeriod + 1],
          middleBand: middleBand[index - timePeriod + 1],
          lowerBand: lowerBand[index - timePeriod + 1],
        },
      };
    }
    return {
      time: data.time,
      bollingerBands: {},
    };
  });
};
export const calculateMA = (formattedData, period) => {
  const inputMA = {
    values: formattedData.map((data) => data.close),
    period,
  };

  const ma = [];
  for (let i = 0; i < inputMA.values.length; i++) {
    if (i < period - 1) {
      ma.push(null); // Not enough data to calculate MA
    } else {
      let sum = 0;
      for (let j = i; j > i - period; j--) {
        sum += inputMA.values[j];
      }
      ma.push(sum / period);
    }
  }

  const maData = ma.map((value, index) => ({
    time: formattedData[index].time,
    [`ma${period}`]: value,
  }));

  return {
    ma,
    maData,
  };
};

export const calculateEMA = (formattedData, period) => {
  const inputEMA = {
    values: formattedData.map((data) => data.close),
    period: period,
  };
  const emaValues = EMA.calculate(inputEMA);

  // Create an array of EMA values with the same length as formattedData
  // Each EMA value corresponds to the data point at the same index
  const emaArray = new Array(formattedData.length - emaValues.length).fill(null);
  return emaArray.concat(emaValues).map((value, index) => ({
    time: formattedData[index].time,
    [`ema${period}`]: value,
  }));
};

export const calculateSMA = (formattedData, period) => {
  const inputSMA = {
    values: formattedData.map((data) => data.close),
    period,
  };
  const sma = SMA.calculate(inputSMA);

  const smaData = sma.map((value, index) => ({ time: formattedData[index + inputSMA.period - 1].time, value: value }));
  return {
    sma,
    smaData,
  };
};

export const calculateMACD = async (formattedData) => {
  const inputMACD = {
    values: formattedData.map((data) => data.close),
    fastPeriod: 12,
    slowPeriod: 26,
    signalPeriod: 9,
    SimpleMAOscillator: false,
    SimpleMASignal: false,
  };
  const macd = MACD.calculate(inputMACD);

  let macdData = macd.map((value, index) => {
    const period = index + inputMACD.slowPeriod + inputMACD.signalPeriod - 2;
    if (!formattedData[period]) {
      return;
    }
    return {
      time: formattedData[period]?.time,
      value: value.MACD,
    };
  });
  macdData = macdData.filter((value) => value !== undefined);
  let signalData = macd.map((value, index) => {
    const period = index + inputMACD.slowPeriod + inputMACD.signalPeriod - 2;
    if (!formattedData[period]) {
      return;
    }
    return {
      time: formattedData[index + inputMACD.slowPeriod + inputMACD.signalPeriod - 2]?.time,
      value: value.signal,
    };
  });
  signalData = signalData.filter((value) => value !== undefined);

  let histogramData = macd.map((value, index) => {
    const period = index + inputMACD.slowPeriod + inputMACD.signalPeriod - 2;
    if (!formattedData[period]) {
      return;
    }
    return {
      time: formattedData[index + inputMACD.slowPeriod + inputMACD.signalPeriod - 2]?.time,
      value: value.histogram,
    };
  });
  histogramData = histogramData.filter((value) => value !== undefined);
  return {
    macd,
    macdData,
    signalData,
    histogramData,
  };
};

export const calculateVolumes = async (formattedData) => {
  const volumeData = formattedData.map((data) => ({
    time: data.time,
    value: data.volume,
    color: data.open > data.close ? 'rgba(255, 82, 82, 0.8)' : 'rgba(4, 232, 36, 0.8)',
  }));
  return volumeData;
};

export const calculateRSIMoreAccuratly = (prices: number[], period = 14): number[] => {
  if (prices.length < period + 1) {
    throw new Error('Not enough data to compute RSI');
  }

  const deltas = prices.slice(1).map((price, i) => price - prices[i]);
  const gains = deltas.map((delta) => Math.max(delta, 0));
  const losses = deltas.map((delta) => Math.abs(Math.min(delta, 0)));

  let avg_gain = gains.slice(0, period).reduce((a, b) => a + b) / period;
  let avg_loss = losses.slice(0, period).reduce((a, b) => a + b) / period;

  let rsis: number[] = [];

  for (let idx = period; idx < prices.length; idx++) {
    if (idx > period) {
      avg_gain = (avg_gain * (period - 1) + gains[idx - 1]) / period;
      avg_loss = (avg_loss * (period - 1) + losses[idx - 1]) / period;
    }

    if (avg_loss === 0) {
      rsis.push(100);
    } else {
      const rs = avg_gain / avg_loss;
      rsis.push(100 - 100 / (1 + rs));
    }
  }

  return rsis;
};

export const calculateRSI = (formattedData, rsiPeriods = [14, 21]) => {
  return rsiPeriods.reduce((acc, period) => {
    const inputRSI = {
      values: formattedData.map((data) => data.close),
      period: period,
    };
    const rsiValues = RSI.calculate(inputRSI);

    acc[`rsi${period}`] = formattedData.map((data, index) => {
      return {
        time: data.time,
        [`rsi${period}`]: rsiValues[index - period + 1],
      };
    });

    return acc;
  }, {});
};

const findFractals = (data) => {
  const bullishFractals: any = [];
  const bearishFractals: any = [];

  for (let i = 2; i < data.length - 2; i++) {
    const [prevPrevCandle, prevCandle, currentCandle, nextCandle, nextNextCandle] = data.slice(i - 2, i + 3);

    if (
      currentCandle.low < prevCandle.low &&
      currentCandle.low < prevPrevCandle.low &&
      currentCandle.low < nextCandle.low &&
      currentCandle.low < nextNextCandle.low
    ) {
      bullishFractals.push({ time: currentCandle.time, value: currentCandle.low });
    }

    if (
      currentCandle.high > prevCandle.high &&
      currentCandle.high > prevPrevCandle.high &&
      currentCandle.high > nextCandle.high &&
      currentCandle.high > nextNextCandle.high
    ) {
      bearishFractals.push({ time: currentCandle.time, value: currentCandle.high });
    }
  }

  return { bullishFractals, bearishFractals };
};

export async function updateIndicators2(
  formattedData,
  emaPeriods = [7, 14, 28, 100, 200],
  rsiPeriods = [14, 21],
  smaPeriods = [7, 9, 14, 28, 100, 200],
  maPeriods = [7, 14, 28, 100, 200], // Add your desired MA periods here
) {
  const bollingerBands = calculateBollingerBands(formattedData);
  const maData = maPeriods.reduce((acc, period) => {
    acc[`ma${period}`] = calculateMA(formattedData, period).maData;
    return acc;
  }, {});

  const emaData = emaPeriods.reduce((acc, period) => {
    acc[`ema${period}`] = calculateEMA(formattedData, period);
    return acc;
  }, {});
  const rsiData = calculateRSI(formattedData, rsiPeriods);
  const smaData = smaPeriods.reduce((acc, period) => {
    acc[`sma${period}`] = calculateSMA(formattedData, period).smaData;
    return acc;
  }, {});

  return formattedData.map((dataPoint, index) => {
    const emaValues = emaPeriods.reduce((acc, period) => {
      acc[`ema${period}`] = emaData[`ema${period}`][index][`ema${period}`];
      return acc;
    }, {});

    const rsiValues = rsiPeriods.reduce((acc, period) => {
      acc[`rsi${period}`] = rsiData[`rsi${period}`][index][`rsi${period}`];
      return acc;
    }, {});

    const smaValues = smaPeriods.reduce((acc, period) => {
      const smaEntry = smaData[`sma${period}`].find((s) => s.time === dataPoint.time);
      acc[`sma${period}`] = smaEntry ? smaEntry.value : undefined;
      return acc;
    }, {});

    const maValues = maPeriods.reduce((acc, period) => {
      const maEntry = maData[`ma${period}`].find((m) => m.time === dataPoint.time);
      acc[`ma${period}`] = maEntry ? maEntry[`ma${period}`] : undefined;
      return acc;
    }, {});

    return {
      ...dataPoint,
      ...bollingerBands[index]?.bollingerBands,
      ema: emaValues,
      rsi: rsiValues,
      sma: smaValues,
      ma: maValues,
    };
  });
}

export default {
  calculateBollingerBands,
  calculateSMA,
  calculateMACD,
  calculateVolumes,
  calculateEMA,
  calculateRSI,
  findFractals,
  updateIndicators2,
};
