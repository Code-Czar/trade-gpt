import { Point } from '@influxdata/influxdb-client'

export function createEMADataPoints(pairName, allTimeFramesEMA) {
    const points: Point[] = []

    allTimeFramesEMA.forEach((ohlcvs, timeframe) => {
        allTimeFramesEMA.get(timeframe).ema7.forEach((entry: any) => {
            const { time, value } = entry

            const point = new Point('pair_data')
                .tag('pair', pairName)
                .tag('timeframe', timeframe)
                .tag('key', 'ema7')

                .timestamp(new Date(time))
                .floatField('value', value)

            points.push(point)
        })
        allTimeFramesEMA.get(timeframe).ema14.forEach((entry: any) => {
            const { time, value } = entry

            const point = new Point('pair_data')
                .tag('pair', pairName)
                .tag('timeframe', timeframe)
                .tag('key', 'ema14')

                .timestamp(new Date(time))
                .floatField('value', value)

            points.push(point)
        })
        allTimeFramesEMA.get(timeframe).ema28.forEach((entry: any) => {
            const { time, value } = entry

            const point = new Point('pair_data')
                .tag('pair', pairName)
                .tag('timeframe', timeframe)
                .tag('key', 'ema28')

                .timestamp(new Date(time))
                .floatField('value', value)

            points.push(point)
        })
    })
    console.log("🚀 ~ file: ema.ts:48 ~ createEMADataPoints ~ points:", points)
    return points
}

export function extractEMAs(results) {
    const ema7Data = results.filter((item) => item.key === 'ema7')
    const ema14Data = results.filter((item) => item.key === 'ema14')
    const ema28Data = results.filter((item) => item.key === 'ema28')
    const emaDataResult = {}
    ema7Data.forEach((item) => {
        if (!emaDataResult[item.timeframe]) {
            emaDataResult[item.timeframe] = {}
        }
        const time = new Date(item._time).getTime()
        if (!emaDataResult[item.timeframe]['ema7']) {
            emaDataResult[item.timeframe]['ema7'] = []
        }
        emaDataResult[item.timeframe]['ema7'].push({
            time,
            value: item._value,
        })
    })
    ema14Data.forEach((item) => {
        if (!emaDataResult[item.timeframe]) {
            emaDataResult[item.timeframe] = {}
        }
        const time = new Date(item._time).getTime()
        if (!emaDataResult[item.timeframe]['ema14']) {
            emaDataResult[item.timeframe]['ema14'] = []
        }
        emaDataResult[item.timeframe]['ema14'].push({
            time,
            value: item._value,
        })
    })
    ema28Data.forEach((item) => {
        if (!emaDataResult[item.timeframe]) {
            emaDataResult[item.timeframe] = {}
        }
        const time = new Date(item._time).getTime()
        if (!emaDataResult[item.timeframe]['ema28']) {
            emaDataResult[item.timeframe]['ema28'] = []
        }
        emaDataResult[item.timeframe]['ema28'].push({
            time,
            value: item._value,
        })
    })
    return emaDataResult
}
