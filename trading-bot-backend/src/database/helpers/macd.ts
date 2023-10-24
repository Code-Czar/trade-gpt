import { Point } from '@influxdata/influxdb-client'

export function createMACDDataPoints(pairName, allRSIData) {
    const points: Point[] = []

    allRSIData.forEach((rsiData, timeframe) => {
        allRSIData.get(timeframe).macdData.forEach((entry: any) => {
            const { time, value } = entry

            const point = new Point('pair_data')
                .tag('pair', pairName)
                .tag('timeframe', timeframe)
                .tag('key', 'macdData')

                .timestamp(new Date(time))
                .floatField('value', value)

            points.push(point)
        })
        allRSIData.get(timeframe).histogramData.forEach((entry: any) => {
            if (!entry.value) {
                return
            }
            const { time, value } = entry

            const point = new Point('pair_data')
                .tag('pair', pairName)
                .tag('timeframe', timeframe)
                .tag('key', 'histogramData')

                .timestamp(new Date(time))
                .floatField('value', value)

            points.push(point)
        })
        allRSIData.get(timeframe).signalData.forEach((entry: any) => {
            if (!entry.value) {
                return
            }
            const { time, value } = entry

            const point = new Point('pair_data')
                .tag('pair', pairName)
                .tag('timeframe', timeframe)
                .tag('key', 'signalData')

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

export function extractMACDData(results) {
    const macdData = results.filter((item) => item.key === 'macdData')
    const histogramData = results.filter((item) => item.key === 'histogramData')
    const signalsData = results.filter((item) => item.key === 'signalData')
    const macdResult = {}
    macdData.forEach((item) => {
        if (!macdResult[item.timeframe]) {
            macdResult[item.timeframe] = {}
        }
        const time = new Date(item._time).getTime()
        if (!macdResult[item.timeframe]['macdData']) {
            macdResult[item.timeframe]['macdData'] = []
        }
        macdResult[item.timeframe]['macdData'].push({
            time,
            value: item._value,
        })
    })
    histogramData.forEach((item) => {
        if (!macdResult[item.timeframe]) {
            macdResult[item.timeframe] = {}
        }
        const time = new Date(item._time).getTime()
        if (!macdResult[item.timeframe]['histogramData']) {
            macdResult[item.timeframe]['histogramData'] = []
        }
        macdResult[item.timeframe]['histogramData'].push({
            time,
            value: item._value,
        })
    })
    signalsData.forEach((item) => {
        if (!macdResult[item.timeframe]) {
            macdResult[item.timeframe] = {}
        }
        const time = new Date(item._time).getTime()
        if (!macdResult[item.timeframe]['signalsData']) {
            macdResult[item.timeframe]['signalsData'] = []
        }
        macdResult[item.timeframe]['signalsData'].push({
            time,
            value: item._value,
        })
    })
    return macdResult
}
