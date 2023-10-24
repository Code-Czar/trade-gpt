import { Point } from '@influxdata/influxdb-client'

export function createRSIDataPoints(pairName, allRSIData) {
    const points: Point[] = []

    allRSIData.forEach((rsiData, timeframe) => {
        allRSIData.get(timeframe).rsiData.forEach((entry: any) => {
            const { time, value } = entry

            const point = new Point('pair_data')
                .tag('pair', pairName)
                .tag('timeframe', timeframe)
                .tag('key', 'rsiData')

                .timestamp(new Date(time))
                .floatField('value', value)

            points.push(point)
        })
    })
    console.log(
        '🚀 ~ file: rsiData.ts:27 ~ createRSIDataPoints ~ points:',
        points,
    )
    return points
}

export function extractRSIData(results) {
    const rsiData = results.filter((item) => item.key === 'rsiData')
    const rsiDataResult = {}
    rsiData.forEach((item) => {
        if (!rsiDataResult[item.timeframe]) {
            rsiDataResult[item.timeframe] = {}
        }
        const time = new Date(item._time).getTime()
        if (!rsiDataResult[item.timeframe]['risData']) {
            rsiDataResult[item.timeframe]['rsiData'] = []
        }
        rsiDataResult[item.timeframe]['rsiData'].push({
            time,
            value: item._value,
        })
    })
    return rsiDataResult
}
