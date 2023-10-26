import { stringifyMap, BINANCE_TIMEFRAMES } from 'trading-shared'
import { InfluxDB, Point } from '@influxdata/influxdb-client'
import {
    extractOHLCV,
    createOHLCVSDataPoints,
    createRSIDataPoints,
    createEMADataPoints,
    extractRSIData,
    createMACDDataPoints,
    createVolumesDataPoints,
    createBoillingerBandsDataPoints
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


    constructor(sampleFilePath: string = 'dataStore.json') {
        this.sampleData = JSON.parse(fs.readFileSync(sampleFilePath, 'utf-8'))

        // this.client = new InfluxDB({
        //     url: 'http://localhost:8086',
        //     token: INFLUXDB_TOKEN,
        //     timeout: 600000,
        // })


        // this.writeApi = this.client.getWriteApi(INFLUXDB_ORG, INFLUXDB_BUCKET)
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
        oneYearAgo.setFullYear(now.getFullYear() - 1)

        const body = {
            start: oneYearAgo.toISOString(),
            stop: now.toISOString(),
        }
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
        this.client.write(data + '\n');
    }




    async insertPairData(pairName: string, data: any) {
        if (!pairName) {
            return;
        }

        const dataPoints = [
            ...createOHLCVSDataPoints(pairName, data.ohlcvs),
            ...createRSIDataPoints(pairName, data.rsi),
            ...createEMADataPoints(pairName, data.ema),
            ...createMACDDataPoints(pairName, data.macd),
            ...createVolumesDataPoints(pairName, data.volumes),
            ...createBoillingerBandsDataPoints(pairName, data.bollingerBands)
        ];
        // global.logger.info("🚀 ~ file: InfluxDBWrapper.ts:113 ~ InfluxDBWrapper ~ insertPairData ~ dataPoints:", dataPoints.length);

        // Push data points to the buffer
        this.dataBuffer.push(...dataPoints);

        // If we're already processing, just exit and let the current process handle the buffer
        if (this.isProcessing) {
            return;
        }

        this.isProcessing = true;

        // Check if buffer size is over the threshold
        while (this.dataBuffer.length >= this.BUFFER_THRESHOLD) {
            let retryCount = 0;
            while (retryCount < MAX_RETRIES) {
                try {
                    // global.logger.info("🚀 ~ file: InfluxDBWrapper.ts:137 ~ InfluxDBWrapper ~ insertPairData ~ this.dataBuffer:", this.dataBuffer.length)
                    const dataToSend = this.dataBuffer.splice(0, this.BUFFER_THRESHOLD);
                    for (const point of dataToSend) {
                        const line = point.toLineProtocol();
                        this.sendDataToTelegraf(line);
                    }
                    break; // Exit the loop if successful
                } catch (error) {
                    retryCount++;
                    if (retryCount >= MAX_RETRIES) {
                        console.error('Error while writing to InfluxDB:', error);
                        fs.appendFileSync(
                            'error.log',
                            `${new Date().toISOString()} - ${error.message}\n`,
                        );
                        fs.appendFileSync('error.log', `${await stringifyMap(data)}`);
                        this.isProcessing = false;
                        throw error;
                    } else {
                        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY_MS));
                    }
                }
            }
        }

        this.isProcessing = false;
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
