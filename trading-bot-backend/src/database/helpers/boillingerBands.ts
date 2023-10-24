import { Point } from '@influxdata/influxdb-client'

export function createBoillingerBandsDataPoints(pairName, allBoillingerBandData) {
    const points: Point[] = []

    allBoillingerBandData.forEach((rsiData, timeframe) => {
        allBoillingerBandData.get(timeframe).upperBand.forEach((entry: any) => {
            const { time, value } = entry

            const point = new Point('pair_data')
                .tag('pair', pairName)
                .tag('timeframe', timeframe)
                .tag('key', 'upperBand')

                .timestamp(new Date(time))
                .floatField('value', value)

            points.push(point)
        })
        allBoillingerBandData.get(timeframe).middleBand.forEach((entry: any) => {
            if (!entry.value) {
                return
            }
            const { time, value } = entry

            const point = new Point('pair_data')
                .tag('pair', pairName)
                .tag('timeframe', timeframe)
                .tag('key', 'middleBand')

                .timestamp(new Date(time))
                .floatField('value', value)

            points.push(point)
        })
        allBoillingerBandData.get(timeframe).lowerBand.forEach((entry: any) => {
            if (!entry.value) {
                return
            }
            const { time, value } = entry

            const point = new Point('pair_data')
                .tag('pair', pairName)
                .tag('timeframe', timeframe)
                .tag('key', 'lowerBand')

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

export function extractBoillingerBandsDataPoints(results) {
    const upperBand = results.filter((item) => item.key === 'upperBand')
    const middleBand = results.filter((item) => item.key === 'middleBand')
    const lowerBand = results.filter((item) => item.key === 'lowerBand')
    const boillingBandsResult = {}
    upperBand.forEach((item) => {
        if (!boillingBandsResult[item.timeframe]) {
            boillingBandsResult[item.timeframe] = {}
        }
        const time = new Date(item._time).getTime()
        if (!boillingBandsResult[item.timeframe]['upperBand']) {
            boillingBandsResult[item.timeframe]['upperBand'] = []
        }
        boillingBandsResult[item.timeframe]['upperBand'].push({
            time,
            value: item._value,
        })
    })
    middleBand.forEach((item) => {
        if (!boillingBandsResult[item.timeframe]) {
            boillingBandsResult[item.timeframe] = {}
        }
        const time = new Date(item._time).getTime()
        if (!boillingBandsResult[item.timeframe]['middleBand']) {
            boillingBandsResult[item.timeframe]['middleBand'] = []
        }
        boillingBandsResult[item.timeframe]['middleBand'].push({
            time,
            value: item._value,
        })
    })
    lowerBand.forEach((item) => {
        if (!boillingBandsResult[item.timeframe]) {
            boillingBandsResult[item.timeframe] = {}
        }
        const time = new Date(item._time).getTime()
        if (!boillingBandsResult[item.timeframe]['lowerBand']) {
            boillingBandsResult[item.timeframe]['lowerBand'] = []
        }
        boillingBandsResult[item.timeframe]['lowerBand'].push({
            time,
            value: item._value,
        })
    })
    return boillingBandsResult
}
