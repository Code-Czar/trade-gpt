import { Point } from '@influxdata/influxdb-client'

export function flattenPairData(pair, pairData) {
    const points: Point[] = []

    allTimeFramesOHLCVS.forEach((ohlcvs, timeframe) => {
        allTimeFramesOHLCVS.get(timeframe).forEach((entry: any) => {
            const [timestamp, open, high, low, close, volume] = entry

            const point = new Point('pair_data')
                .tag('pair', pairName)
                .stringField('timeframe', timeframe)
                .stringField('key', 'ohlcvs')
                .timestamp(new Date(timestamp))
                .floatField('open', open)
                .floatField('high', high)
                .floatField('low', low)
                .floatField('close', close)
                .intField('volume', volume)

            points.push(point)
        })
    })
    return points
}

export function structureDataPoint(results) {
    const ohlcvs = results.filter((item) => item.key === 'ohlcvs')
    const ohlcvsResult = {}
    ohlcvs.forEach((item) => {
        if (!ohlcvsResult[item.timeframe]) {
            ohlcvsResult[item.timeframe] = {}
        }
        const time = new Date(item._time).getTime()
        if (!ohlcvsResult[item.timeframe][time]) {
            ohlcvsResult[item.timeframe][time] = {}
        }
        if (item._field === 'open') {
            ohlcvsResult[item.timeframe][time].open = item._value
        }
        if (item._field === 'high') {
            ohlcvsResult[item.timeframe][time].high = item._value
        }
        if (item._field === 'low') {
            ohlcvsResult[item.timeframe][time].low = item._value
        }
        if (item._field === 'close') {
            ohlcvsResult[item.timeframe][time].close = item._value
        }
        if (item._field === 'volume') {
            ohlcvsResult[item.timeframe][time].volume = item._value
        }
    })
    const ohlcvsTimeframes = Object.keys(ohlcvsResult)
    const finalResult = {}

    ohlcvsTimeframes.forEach((timeframe) => {
        if (!finalResult[timeframe]) {
            finalResult[timeframe] = {}
        }
        finalResult[timeframe] = Object.entries(ohlcvsResult[timeframe])?.map(
            ([timeframe, ohlcvs]) => [
                parseInt(timeframe),
                ohlcvs.open,
                ohlcvs.high,
                ohlcvs.low,
                ohlcvs.close,
                ohlcvs.volume,
            ],
        )
    })
    return finalResult
}
