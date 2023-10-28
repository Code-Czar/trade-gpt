import { Point } from '@influxdata/influxdb-client';
import { sortDataAscending } from './convertData';
import { formatOHLCVForChartData } from './formatData';
import {
    calculateRSI,
    calculateVolumes,
    calculateSMA,
    calculateEMA,
    calculateMACD,
    calculateBollingerBands,
} from '../calculations';

const findValue = (inputArray, timestamp, singleValue = true) => {
    // console.log("🚀 ~ file: convertToDataStore.ts:14 ~ inputArray:", inputArray);
    if (singleValue) {
        return inputArray?.find((item) => item.time === timestamp)?.value;
    } else {
        return inputArray?.find((item) => item.time === timestamp);
    }
};

export const convertPairToDataArray = async (inputPair) => {
    // console.log("🚀 ~ file: convertToDataStore.ts:2 ~ inputPair:", inputPair);
    // global.logger.info("Shared debug")

    const ohlcvs = inputPair['ohlcvs'];
    if (!ohlcvs) {
        return;
    }

    const ema = inputPair['ema'];
    const macd = inputPair['macd'];
    const rsi = inputPair['rsi'];
    const sma = inputPair['sma'];

    const timeFrames = [...ohlcvs.keys()];
    const points = {};

    // console.log("🚀 ~ file: convertToDataStore.ts:36 ~ timeFrames:", timeFrames);
    timeFrames.forEach((timeframe) => {
        points[timeframe] = [];

        const ohlcvsData = ohlcvs.get(timeframe);
        const emaData = ema.get(timeframe);
        const ema7Data = emaData['ema7']?.emaData;
        const ema14Data = emaData['ema14']?.emaData;
        const ema28Data = emaData['ema28']?.emaData;
        const macdData = macd.get(timeframe);
        const rsiData = rsi.get(timeframe);

        // console.log("🚀 ~ file: convertToDataStore.ts:44 ~ ohlcvsData:", ohlcvsData);
        // console.log("🚀 ~ file: convertToDataStore.ts:46 ~ emaData:", emaData);
        // console.log("🚀 ~ file: convertToDataStore.ts:48 ~ ema7Data:", ema7Data);
        // console.log("🚀 ~ file: convertToDataStore.ts:50 ~ ema14Data:", ema14Data);
        // console.log("🚀 ~ file: convertToDataStore.ts:52 ~ ema28Data:", ema28Data);
        // console.log("🚀 ~ file: convertToDataStore.ts:54 ~ macdData:", macdData);
        // console.log("🚀 ~ file: convertToDataStore.ts:56 ~ rsiData:", rsiData);

        ohlcvsData.forEach((data) => {
            // console.log("🚀 ~ file: convertToDataStore.ts:44 ~ data:", data);
            const pointTimestamp = data[0];
            const currentPoint = {
                timestamp: pointTimestamp,
                timeframe: timeframe,
                pairName: inputPair.details.name,
                open: data[1],
                high: data[2],
                low: data[3],
                close: data[4],
                volumes: data[5],
                ema7: findValue(ema7Data, pointTimestamp),
                ema14: findValue(ema14Data, pointTimestamp),
                ema28: findValue(ema28Data, pointTimestamp),
                macdHistogram: findValue(macdData?.['histogramData'], pointTimestamp),
                macdData: findValue(macdData?.['macdData'], pointTimestamp),
                signalData: findValue(macdData?.['signalData'], pointTimestamp),
                rsi: findValue(rsiData?.['rsiData'], pointTimestamp),
            };
            points[timeframe].push(currentPoint);
        });
    });
    return sortDataAscending(Object.values(points).flat());
};



export const convertPointArrayToInfluxPoints = async (dataArray) => {
    const points = [];

    dataArray.forEach((data) => {
        const point = new Point('pair_data')
            .tag('pair', data.pairName)
            .tag('timeframe', data.timeframe)
            // .stringField('timeframe', data.timeframe)
            .timestamp(new Date(data.timestamp))
            .floatField('open', data.open)
            .floatField('high', data.high)
            .floatField('low', data.low)
            .floatField('close', data.close)
            .intField('volumes', data.volumes);

        if (data.ema7 !== undefined) {
            point.floatField('ema7', data.ema7);
        }

        if (data.ema14 !== undefined) {
            point.floatField('ema14', data.ema14);
        }

        if (data.ema28 !== undefined) {
            point.floatField('ema28', data.ema28);
        }

        if (data.macdHistogram !== undefined) {
            point.floatField('macdHistogram', data.macdHistogram);
        }

        if (data.macdData !== undefined) {
            point.floatField('macdData', data.macdData);
        }

        if (data.signalData !== undefined) {
            point.floatField('signalData', data.signalData);
        }

        if (data.rsi !== undefined) {
            point.floatField('rsi', data.rsi);
        }

        // console.log("🚀 ~ file: convertToDataStore.ts:115 ~ data:", data);
        points.push(point);
    });

    return points;
};

export const mergeIndicatorsWithFormattedData = async (formattedData, indicators, timeframe, pairName) => {

    const mergedData = formattedData.map((data) => {
        console.log("🚀 ~ file: convertToDataStore.ts:140 ~ data:", data);
        return {
            timestamp: data.time,
            timeframe: timeframe,
            pairName: pairName,
            open: data.open,
            high: data.high,
            low: data.low,
            close: data.close,
            volumes: data.volume,
            ema7: findValue(indicators.EMA7.emaData, data.time),
            ema14: findValue(indicators.EMA14.emaData, data.time),
            ema28: findValue(indicators.EMA28.emaData, data.time),
            macdHistogram: findValue(indicators.histogramData, data.time),
            macdData: findValue(indicators.macdData, data.time),
            signalData: findValue(indicators.signalData, data.time),
            rsi: findValue(indicators.rsiData, data.time),

        }

    });
    return mergedData;
};
export const mergeIndicatorsWithOHLCVs = async (ohlcvs, indicators, timeframe, pairName) => {
    // console.log("🚀 ~ file: convertToDataStore.ts:155 ~ indicators:", indicators, ohlcvs);

    const mergedData = ohlcvs.map((data) => {
        // console.log("🚀 ~ file: convertToDataStore.ts:167 ~ data:", data);
        return {
            timestamp: data.time,
            timeframe: timeframe,
            pairName: pairName,
            open: data.open,
            high: data.high,
            low: data.low,
            close: data.close,
            volumes: data.volume,
            ema7: findValue(indicators.EMA7.emaData, data.time),
            ema14: findValue(indicators.EMA14.emaData, data.time),
            ema28: findValue(indicators.EMA28.emaData, data.time),
            macdHistogram: findValue(indicators.histogramData, data.time),
            macdData: findValue(indicators.macdData, data.time),
            signalData: findValue(indicators.signalData, data.time),
            rsi: findValue(indicators.rsiData, data.time),

        }

    });
    return mergedData;
};

export const generateIndicatorsFromOHLCVs = async (ohlcvs) => {
    const formattedData = formatOHLCVForChartData(ohlcvs); // Assuming this method exists in your indicators module

    // Calculate and update RSI
    const { rsi, rsiData } = await calculateRSI(formattedData);

    // Calculate and update Volumes
    const volumes = await calculateVolumes(formattedData);

    // Calculate and update SMA
    const sma = await calculateSMA(formattedData);

    // Calculate and update EMA
    const EMA7 = await calculateEMA(formattedData, 7);
    const EMA14 = await calculateEMA(formattedData, 14);
    const EMA28 = await calculateEMA(formattedData, 28);

    // Calculate and update MACD
    const { macdData, signalData, histogramData } = await calculateMACD(formattedData);

    // Calculate and update Bollinger Bands
    const { upperBand, lowerBand, middleBand } = await calculateBollingerBands(formattedData, 20);

    return {
        formattedData,
        rsi,
        rsiData,
        volumes,
        sma,
        EMA7,
        EMA14,
        EMA28,
        macdData,
        signalData,
        histogramData,
        upperBand,
        lowerBand,
        middleBand,
    };
};
