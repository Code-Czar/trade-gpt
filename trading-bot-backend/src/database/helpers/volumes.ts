import { Point } from '@influxdata/influxdb-client'

export function createVolumesDataPoints(pairName, allVolumesData) {
    const points: Point[] = []

    allVolumesData.forEach((rsiData, timeframe) => {
        allVolumesData.get(timeframe).forEach((entry: any) => {
            const { time, value, color } = entry

            const point = new Point('pair_data')
                .tag('pair', pairName)
                .stringField('timeframe', timeframe)
                .stringField('key', 'volumesData')

                .timestamp(new Date(time))
                .floatField('value', value)
                .stringField('color', color)

            points.push(point)
        })
    })
    return points
}

export function extractVolumesDataPoints(results) {
    const volumesData = results.filter((item) => item.key === 'volumesData')
    const volumesDataResult = {}
    volumesData.forEach((item) => {
        if (!volumesDataResult[item.timeframe]) {
            volumesDataResult[item.timeframe] = {}
        }
        const time = new Date(item._time).getTime()
        if (!volumesDataResult[item.timeframe]) {
            volumesDataResult[item.timeframe] = []
        }
        volumesDataResult[item.timeframe].push({
            time,
            value: item._value,
            color: item._color,
        })
    })
    return volumesDataResult
}
