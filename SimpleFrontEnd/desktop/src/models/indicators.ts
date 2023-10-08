import { SMA, EMA, RSI, MACD } from 'technicalindicators';



const sma = (arr, windowSize) => {
    const result = [];
    for (let i = windowSize - 1; i < arr.length; i++) {
        const window = arr.slice(i - windowSize + 1, i + 1);
        const average = window.reduce((sum, num) => sum + num, 0) / windowSize;
        result.push(average);
    }
    return result;
};

const standardDeviation = (arr, windowSize, smaValues) => {
    const result = [];
    for (let i = windowSize - 1; i < arr.length; i++) {
        const window = arr.slice(i - windowSize + 1, i + 1);
        const variance =
            window.reduce((sum, num) => sum + Math.pow(num - smaValues[i - windowSize + 1], 2), 0) / windowSize;
        result.push(Math.sqrt(variance));
    }
    return result;
};



export const calculateBollingerBands = async (formattedData, timePeriod = 20) => {
    const closePrices = formattedData.map((datum) => datum.close);
    const sma20 = sma(closePrices, 20);
    const stdDev20 = standardDeviation(closePrices, 20, sma20);

    const upperBand = sma20.map((value, index) => ({
        time: formattedData[index + 19].time,
        value: value + 2 * stdDev20[index],
    }));
    const middleBand = sma20.map((value, index) => ({ time: formattedData[index + 19].time, value }));
    const lowerBand = sma20.map((value, index) => ({
        time: formattedData[index + 19].time,
        value: value - 2 * stdDev20[index],
    }));
    return {
        upperBand,
        middleBand,
        lowerBand,
    }

};


export const calculateSMA = async (formattedData) => {
    const inputSMA = {
        values: formattedData.map((data) => data.close),
        period: 200,
    };
    const sma = SMA.calculate(inputSMA);

    const smaData = sma.map((value, index) => ({ time: formattedData[index + inputSMA.period - 1].time, value: value }));
    return {
        sma,
        smaData
    }
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
    // console.log("🚀 ~ file: TradingChart.vue:270 ~ watchEffect ~ macd:", macd, inputMACD)

    let macdData = macd.map((value, index) => {
        const period = index + inputMACD.slowPeriod + inputMACD.signalPeriod - 2;
        if (!formattedData[period]) { return };
        return {
            time: formattedData[period]?.time,
            value: value.MACD,
        }
    });
    macdData = macdData.filter((value) => value !== undefined);
    let signalData = macd.map((value, index) => {
        const period = index + inputMACD.slowPeriod + inputMACD.signalPeriod - 2;
        if (!formattedData[period]) { return };
        return {
            time: formattedData[index + inputMACD.slowPeriod + inputMACD.signalPeriod - 2]?.time,
            value: value.signal,
        }
    });
    signalData = signalData.filter((value) => value !== undefined);

    let histogramData = macd.map((value, index) => {
        const period = index + inputMACD.slowPeriod + inputMACD.signalPeriod - 2;
        if (!formattedData[period]) { return };
        return {
            time: formattedData[index + inputMACD.slowPeriod + inputMACD.signalPeriod - 2]?.time,
            value: value.histogram,
        }
    });
    histogramData = histogramData.filter((value) => value !== undefined);
    return {
        macd,
        macdData,
        signalData,
        histogramData
    }
};

export const calculateVolumes = async (formattedData) => {
    const volumeData = formattedData.map((data) => ({
        time: data.time / 1000,
        value: data.volume,
        color: data.open > data.close ? 'rgba(255, 82, 82, 0.8)' : 'rgba(4, 232, 36, 0.8)',
    }));
    return volumeData

};

export const calculateEMA = async (formattedData, period) => {
    const inputEMA7 = {
        values: formattedData.map((data) => data.close),
        period: period,
    };
    const ema = EMA.calculate(inputEMA7);

    const emaData = ema.map((value, index) => ({ time: formattedData[index + inputEMA7.period - 1].time, value: value }));
    return {
        ema,
        emaData
    }
}


export const calculateRSI = async (formattedData) => {
    const inputRSI = {
        values: formattedData.map((data) => data.close),
        period: 14,
    };
    const rsi = RSI.calculate(inputRSI);

    const rsiData = rsi.map((value, index) => ({ time: formattedData[index + inputRSI.period - 1].time, value: value }));
    return { rsiData, rsi }

};


const findFractals = (data) => {
    const bullishFractals = [];
    const bearishFractals = [];

    // Starting from the 2nd index because we need two preceding candles to evaluate
    // Ending at length - 2 because we need two following candles to evaluate
    for (let i = 2; i < data.length - 2; i++) {
        const [prevPrevCandle, prevCandle, currentCandle, nextCandle, nextNextCandle] = data.slice(i - 2, i + 3);

        // Bullish Fractal: a low preceded and followed by higher lows
        if (
            currentCandle.low < prevCandle.low &&
            currentCandle.low < prevPrevCandle.low &&
            currentCandle.low < nextCandle.low &&
            currentCandle.low < nextNextCandle.low
        ) {
            bullishFractals.push({ time: currentCandle.time, value: currentCandle.low });
        }

        // Bearish Fractal: a high preceded and followed by lower highs
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





export default {
    calculateBollingerBands,
    calculateSMA,
    calculateMACD,
    calculateVolumes,
    calculateEMA,
    calculateRSI,
    findFractals
}