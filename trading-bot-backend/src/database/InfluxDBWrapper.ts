import { apiConnector, convertPairToDataArray, convertPointArrayToInfluxPoints } from 'trading-shared'
import { InfluxDB, Point } from '@influxdata/influxdb-client'
import {
    extractRSIData,
} from './helpers'

const lodash = require('lodash')
const fetch = require('node-fetch')
const fs = require('fs')
const net = require('net');

// ... your TradingBot methods ...




const INFLUXDB_TOKEN =
    '4ZfjXEI2NKF2OlcGCPvHcC7q3emHJtD_36PqUdGMEAeeH0KxAN7Z7l5iFrQFfR7hQElnn7EwP7uCAW9olVWUHA=='

const INFLUXDB_ORG = 'Opportunities'
const INFLUXDB_BUCKET = 'opportunities'
const MAX_RETRIES = 3
const RETRY_DELAY_MS = 2000

export class InfluxDBWrapper {
    sampleData: any
    client: InfluxDB
    writeApi: any
    dataBuffer: any[] = [];  // Buffer to store data points
    BUFFER_THRESHOLD = 5000; // Set a default threshold
    private isProcessing: boolean = false;  // Lock flag


    constructor() {
        this.initTelegrafClient();
    }

    initTelegrafClient() {
        this.client = new net.Socket();
        this.client.connect(8094, '127.0.0.1')
        this.client.on('error', (err) => {
            console.error('Error with Telegraf client:', err);
            // Re-initialize the connection after a delay
            setTimeout(() => this.initTelegrafClient(), 5000);
        });
    }
    async clearBucketData() {
        const endpoint = `http://localhost:8086/api/v2/delete?org=${INFLUXDB_ORG}&bucket=${INFLUXDB_BUCKET}`
        const now = new Date()
        const oneYearAgo = new Date()
        oneYearAgo.setFullYear(now.getFullYear() - 10)

        const body = {
            start: oneYearAgo.toISOString(),
            stop: now.toISOString(),
        }
        try {
            const response = await apiConnector.post(endpoint,
                JSON.stringify(body),
                {
                    Authorization: `Token ${INFLUXDB_TOKEN}`,
                    'Content-Type': 'application/json',
                },
            )

            if (response.status !== 200) {
                const errorData = await response.text()
                throw new Error(`Failed to delete data: ${errorData}`)
            }

            global.logger.info('Data deletion complete.')
        } catch (error) {
            console.error('Error while deleting data from InfluxDB:', error)
            fs.appendFileSync(
                'error.log',
                `${new Date().toISOString()} - ${error.message}\n`,
            )
            throw error
        }
    }

    sendDataToTelegraf(data) {
        // global.logger.debug("🚀 ~ file: InfluxDBWrapper.ts:101 ~ data:", data);
        const batchedData = data.map(point => point.toLineProtocol()).join('\n');
        this.client.write(batchedData + '\n');
    }


    async writePairToDatabase(inputPair) {
        const result = await convertPairToDataArray(await inputPair)
        // console.log("🚀 ~ file: InfluxDBWrapper.ts:94 ~ result:", result);
        const points = await convertPointArrayToInfluxPoints(await result)
        // console.log("🚀 ~ file: InfluxDBWrapper.ts:95 ~ points:", points.length);
        // global.logger.debug("🚀 ~ file: InfluxDBWrapper.ts:108 ~ points:", points.length);

        this.isProcessing = true;

        this.sendDataToTelegraf(points);


        this.isProcessing = false;
    }

    async pushNewDataToDB(inputPair, lastDataNumber) {
        const result = (await convertPairToDataArray(await inputPair)).slice(-lastDataNumber)
        const points = await convertPointArrayToInfluxPoints(await result)
        this.sendDataToTelegraf(points)
        return points
    }



    async getPairData(pair: string) {
        // Reconstruct the JSON format
        let reconstructedData: any = {
            leveragePairs: {},
        }

        reconstructedData.leveragePairs[pair] = {
            ohlcvs: {},
        }
        const queryApi = this.client.getQueryApi(INFLUXDB_ORG)
        const fluxQuery = `from(bucket: "${INFLUXDB_BUCKET}") 
        |> range(start: -30d) 
        |> filter(fn: (r) => r["_measurement"] == "pair_data")`
        const results: any[] = []

        await queryApi.queryRows(fluxQuery, {
            next(row: any, tableMeta: any) {
                const o: any = tableMeta.toObject(row)
                results.push(o)
            },
            error(error: Error) {
                console.error('Error querying data from InfluxDB:', error)
                throw error
            },
            complete() {
                const ohlcvs = extractOHLCV(results)
                const rsiData = extractRSIData(results)
            },
        })
    }

    // Add other methods as needed
}

// Export the class for external use
export default InfluxDBWrapper
