import { Point } from '@influxdata/influxdb-client';


export function createOHLCVSDataPoints(pairName, allTimeFramesOHLCVS) {
    const points: Point[] = [];

    // Iterating through the timeframes (e.g., 1h, 1d)
    allTimeFramesOHLCVS.forEach((ohlcvs, timeframe) => {

        // console.log("🚀 ~ file: InfluxDBWrapper.ts:38 ~ InfluxDBWrapper ~ Object.entries ~ timeframe:", timeframe)
        allTimeFramesOHLCVS.get(timeframe).forEach((entry: any) => {
            const [timestamp, open, high, low, close, volume] = entry;


            const point = new Point('pair_data')
                .tag('pair', pairName)
                .tag('timeframe', timeframe)
                .tag('key', 'ohlcvs')
                // .timestamp(timestamp * 1e6)

                // .timestamp(timestamp)
                .timestamp(new Date(timestamp))
                .floatField('open', open)
                .floatField('high', high)
                .floatField('low', low)
                .floatField('close', close)
                .intField('volume', volume);

            // this.writeApi.flush();
            points.push(point);
            // console.log("🚀 ~ file: InfluxDBWrapper.ts:38 ~ InfluxDBWrapper ~ data.ohlcvs[timeframe].forEach ~ entry:", entry, point)
        });
    });
    return points;
}


export function extractOHLCV(results) {
    const ohlcvs = results.filter((item) => item.key === 'ohlcvs');
    const ohlcvsResult = {};
    ohlcvs.forEach((item) => {
        if (!ohlcvsResult[item.timeframe]) {
            ohlcvsResult[item.timeframe] = {};
        }
        const time = new Date(item._time).getTime();
        if (!ohlcvsResult[item.timeframe][time]) {

            ohlcvsResult[item.timeframe][time] = {};
        }

        // console.log("🚀 ~ file: InfluxDBWrapper.ts:183 ~ InfluxDBWrapper ~ ohlcvs.forEach ~ item._field:", item._field)
        if (item._field === 'open') {
            ohlcvsResult[item.timeframe][time].open = item._value;
        }
        if (item._field === 'high') {
            ohlcvsResult[item.timeframe][time].high = item._value;
        }
        if (item._field === 'low') {
            ohlcvsResult[item.timeframe][time].low = item._value;
        }
        if (item._field === 'close') {
            ohlcvsResult[item.timeframe][time].close = item._value;
        }
        if (item._field === 'volume') {
            ohlcvsResult[item.timeframe][time].volume = item._value;
        }
    });
    const ohlcvsTimeframes = Object.keys(ohlcvsResult);
    const finalResult = {};


    ohlcvsTimeframes.forEach((timeframe) => {
        console.log("🚀 ~ file: InfluxDBWrapper.ts:50 ~ ohlcvsTimeframes.forEach ~ timeframe:", timeframe)
        if (!finalResult[timeframe]) {
            finalResult[timeframe] = {};
        }
        finalResult[timeframe] = Object.entries(ohlcvsResult[timeframe])?.map(([timeframe, ohlcvs]) => ([parseInt(timeframe), ohlcvs.open, ohlcvs.high, ohlcvs.low, ohlcvs.close, ohlcvs.volume]));
    });

    console.log("🚀 ~ file: InfluxDBWrapper.ts:211 ~ InfluxDBWrapper ~ ohlcvsTimeframes.forEach ~ finalResult:", finalResult)
    console.log("🚀 ~ file: InfluxDBWrapper.ts:211 ~ InfluxDBWrapper ~ ohlcvsTimeframes.forEach ~ finalResultComplete:")

    return finalResult;

}