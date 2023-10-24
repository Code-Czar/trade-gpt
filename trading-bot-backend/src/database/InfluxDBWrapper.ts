import { stringifyMap, BINANCE_TIMEFRAMES } from 'trading-shared'
import { InfluxDB, Point } from '@influxdata/influxdb-client'
import {
    extractOHLCV,
    createOHLCVSDataPoints,
    createRSIDataPoints,
    createEMADataPoints,
    extractRSIData,
} from './helpers'
// import lodash from 'lodash';

const lodash = require('lodash')
const fetch = require('node-fetch')
const fs = require('fs')

const INFLUXDB_TOKEN =
    '4ZfjXEI2NKF2OlcGCPvHcC7q3emHJtD_36PqUdGMEAeeH0KxAN7Z7l5iFrQFfR7hQElnn7EwP7uCAW9olVWUHA=='

// const INFLUXDB_TOKEN = 'YOUR_TOKEN';
const INFLUXDB_ORG = 'Opportunities'
const INFLUXDB_BUCKET = 'opportunities'

export class InfluxDBWrapper {
    sampleData: any
    client: InfluxDB
    writeApi: any

    constructor(sampleFilePath: string = 'dataStore.json') {
        this.sampleData = JSON.parse(fs.readFileSync(sampleFilePath, 'utf-8'))

        this.client = new InfluxDB({
            url: 'http://localhost:8086',
            token: INFLUXDB_TOKEN,
            timeout: 60000,
        })

        this.writeApi = this.client.getWriteApi(INFLUXDB_ORG, INFLUXDB_BUCKET)
    }
    async clearBucketData() {
        const endpoint = `http://localhost:8086/api/v2/delete?org=${INFLUXDB_ORG}&bucket=${INFLUXDB_BUCKET}`
        const now = new Date()
        const oneYearAgo = new Date()
        oneYearAgo.setFullYear(now.getFullYear() - 1)

        const body = {
            start: oneYearAgo.toISOString(),
            stop: now.toISOString(),
        }
        console.log(
            '🚀 ~ file: InfluxDBWrapper.ts:36 ~ InfluxDBWrapper ~ clearBucketData ~ body:',
            body,
        )

        try {
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    Authorization: `Token ${INFLUXDB_TOKEN}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(body),
            })

            if (!response.ok) {
                const errorData = await response.text()
                throw new Error(`Failed to delete data: ${errorData}`)
            }

            console.log('Data deletion complete.')
        } catch (error) {
            console.error('Error while deleting data from InfluxDB:', error)
            fs.appendFileSync(
                'error.log',
                `${new Date().toISOString()} - ${error.message}\n`,
            )
            throw error
        }
    }

    async insertPairData(pairName: string, data: any) {
        if (!pairName) {
            return
        }
        // await this.clearBucketData();
        console.log(
            '🚀 ~ file: InfluxDBWrapper.ts:28 ~ InfluxDBWrapper ~ insertPairData ~ pair:',
            data,
        )
        try {
            this.writeApi.writePoints(createOHLCVSDataPoints(pairName, data.ohlcvs))
            this.writeApi.writePoints(createRSIDataPoints(pairName, data.rsi))
            this.writeApi.writePoints(createEMADataPoints(pairName, data.ema))
            this.writeApi.flush()
            // await this.writeApi.close();
        } catch (error) {
            console.error('Error while writing to InfluxDB:', error)
            fs.appendFileSync(
                'error.log',
                `${new Date().toISOString()} - ${error.message}\n`,
            )
            fs.appendFileSync('error.log', `${await stringifyMap(data)}`)
            throw error
        }
    }

    async getPairData(pair: string) {
        // Reconstruct the JSON format
        let reconstructedData: any = {
            leveragePairs: {},
        }

        reconstructedData.leveragePairs[pair] = {
            ohlcvs: {},
        }

        console.log(
            '🚀 ~ file: InfluxDBWrapper.ts:140 ~ InfluxDBWrapper ~ getPairData ~ pair:',
            pair,
        )
        const queryApi = this.client.getQueryApi(INFLUXDB_ORG)
        const fluxQuery = `from(bucket: "${INFLUXDB_BUCKET}") 
        |> range(start: -30d) 
        |> filter(fn: (r) => r["_measurement"] == "pair_data")`
        console.log(
            '🚀 ~ file: InfluxDBWrapper.ts:145 ~ InfluxDBWrapper ~ getPairData ~ fluxQuery:',
            fluxQuery,
        )
        const results: any[] = []

        await queryApi.queryRows(fluxQuery, {
            next(row: any, tableMeta: any) {
                const o: any = tableMeta.toObject(row)
                console.log(
                    '🚀 ~ file: InfluxDBWrapper.ts:152 ~ InfluxDBWrapper ~ next ~ o:',
                    o,
                )
                results.push(o)
            },
            error(error: Error) {
                console.error('Error querying data from InfluxDB:', error)
                throw error
            },
            complete() {
                console.log(
                    '🚀 ~ file: InfluxDBWrapper.ts:154 ~ InfluxDBWrapper ~ next ~ results:',
                    results,
                )
                const ohlcvs = extractOHLCV(results)
                const rsiData = extractRSIData(results)
            },
        })
    }

    // Add other methods as needed
}

// Export the class for external use
export default InfluxDBWrapper
