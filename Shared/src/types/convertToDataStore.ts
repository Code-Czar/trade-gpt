import { VersatileLogger } from "../logger";
import { Point } from '@influxdata/influxdb-client'

// global.logger = new VersatileLogger('SharedLibrary', true, true);
const findValue = (inputArray, timestamp, singleValue = true) => {
    if (singleValue) {
        return inputArray?.find((item) => item.time === timestamp)?.value
    }
    else {
        return inputArray?.find((item) => item.time === timestamp)
    }
}

export const convertPairToDataArray = async (inputPair) => {
    // console.log("🚀 ~ file: convertToDataStore.ts:2 ~ inputPair:", inputPair);
    global.logger.info("Shared debug")

    const ohlcvs = inputPair['ohlcvs']
    if (!ohlcvs) {
        return;
    }

    const ema = inputPair['ema']
    const macd = inputPair['macd']
    const rsi = inputPair['rsi']
    const sma = inputPair['sma']

    const timeFrames = [...ohlcvs.keys()];
    console.log("🚀 ~ file: convertToDataStore.ts:27 ~ timeFrames:", timeFrames);
    const points = {}

    timeFrames.forEach((timeframe) => {
        points[timeframe] = []

        const ohlcvsData = ohlcvs.get(timeframe)
        const emaData = ema.get(timeframe)
        const ema7Data = emaData["ema7"]
        const ema14Data = emaData["ema14"]
        const ema28Data = emaData["ema28"]
        const macdData = macd.get(timeframe)
        const rsiData = rsi.get(timeframe)


        ohlcvsData.forEach((data) => {
            const pointTimestamp = data[0]
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

            }
            points[timeframe].push(currentPoint)
        })
    })
    return Object.values(points).flat();

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

        points.push(point);
    });

    return points;
}

