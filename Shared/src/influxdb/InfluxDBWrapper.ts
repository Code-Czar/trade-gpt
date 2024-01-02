import { apiConnector } from '../api';
import { convertPairToDataArray, convertPairToPointArray } from '../types/';
import { convertPointArrayToInfluxPoints } from '../types/';
import { InfluxDB } from '@influxdata/influxdb-client';

const fs = require('fs');
const net = require('net');

const INFLUXDB_TOKEN = '5V0ivZa_cIaUW1pj4AZbyq2-Jx1sCiTVRi777wAJkrduRlYvvhmNhOUU-h1oHKAGZLXOLAocXBcskee9w8bpzw==';

const INFLUXDB_ORG = 'Opportunities';
const INFLUXDB_BUCKET = 'Opportunities';
const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 2000;

export class InfluxDBWrapper {
  sampleData: any;
  telegrafClient: InfluxDB;
  influxClient: any;
  writeApi: any;
  dataBuffer: any[] = []; // Buffer to store data points
  BUFFER_THRESHOLD = 5000; // Set a default threshold
  private isProcessing: boolean = false; // Lock flag

  constructor() {
    this.initTelegrafClient();
    // Initialize the InfluxDB client
    this.influxClient = new InfluxDB({
      url: 'http://localhost:8086',
      token: INFLUXDB_TOKEN,
    });
  }

  initTelegrafClient() {
    this.telegrafClient = new net.Socket();
    this.telegrafClient.connect(8094, '127.0.0.1');
    this.telegrafClient.on('error', (err) => {
      console.error('Error with Telegraf client:', err);
      // Re-initialize the connection after a delay
      setTimeout(() => this.initTelegrafClient(), 5000);
    });
  }
  async clearBucketData() {
    const endpoint = `http://localhost:8086/api/v2/delete?org=${INFLUXDB_ORG}&bucket=${INFLUXDB_BUCKET}`;
    const now = new Date();
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(now.getFullYear() - 10);

    const body = {
      start: oneYearAgo.toISOString(),
      stop: now.toISOString(),
    };

    const headers = {
      Authorization: `Token ${INFLUXDB_TOKEN}`,
      'Content-Type': 'application/json',
    };

    try {
      const response = await apiConnector.post(endpoint, JSON.stringify(body), headers);
      console.log('🚀 ~ file: InfluxDBWrapper.ts:63 ~ response:', response);

      if (response.status !== 204) {
        // InfluxDB typically returns a 204 status for successful deletes
        const errorData = await response.data;
        throw new Error(`Failed to delete data: ${errorData}`);
      }

      global.logger.info('Data deletion complete.');
    } catch (error) {
      global.logger.error(`Error while deleting data from InfluxDB: ${error.message}`);
      fs.appendFileSync('error.log', `${new Date().toISOString()} - ${error.message}\n`);
      throw error;
    }
  }

  public sendDataToTelegraf(data) {
    // global.logger.debug('🚀 ~ file: InfluxDBWrapper.ts:101 ~ data:', data);
    const batchedData = data.map((point) => point.toLineProtocol()).join('\n');
    this.telegrafClient.write(batchedData + '\n');
  }

  async writePairToDatabase(inputPair) {
    if (!inputPair) {
      global.logger.error('Cannot write pair to database :', { name: inputPair.details.name, pairDetails: inputPair });
      return;
    }

    const points = await convertPairToPointArray(await inputPair);

    this.isProcessing = true;

    this.sendDataToTelegraf(points);

    this.isProcessing = false;
  }

  async pushNewDataToDB(pointsArray) {
    const points = await convertPointArrayToInfluxPoints(pointsArray);
    // console.log('🚀 ~ file: InfluxDBWrapper.ts:101 ~ this:', this);
    this.sendDataToTelegraf(points);
    return points;
  }
  async listFieldsForPair(pairName: string) {
    let fields = [];

    const queryApi = this.influxClient.getQueryApi(INFLUXDB_ORG);
    const fluxQuery = `
        from(bucket: "Opportunities")
        |> range(start: -1y)  // Adjust this range as needed
        |> filter(fn: (r) => r["_measurement"] == "pair_data")
        |> filter(fn: (r) => r["pair"] == "${pairName}")
        |> keep(columns: ["_field"])
        |> distinct(column: "_field")`;

    console.log('Executing Flux query to list fields:', fluxQuery); // Debug log

    try {
      const results = await new Promise((resolve, reject) => {
        const queryResults = [];
        queryApi.queryRows(fluxQuery, {
          next(row, tableMeta) {
            const o = tableMeta.toObject(row);
            queryResults.push(o._field);
          },
          error(error) {
            console.error('Error querying data from InfluxDB:', error);
            reject(error);
          },
          complete() {
            resolve(queryResults);
          },
        });
      });

      fields = results;
    } catch (error) {
      console.error('An error occurred while listing fields:', error);
    }

    return fields;
  }

  async getPairData(
    pairName: string,
    timeRangeStart: string,
    timeRangeStop: string,
    timeframes: string[],
    fields: string[],
  ) {
    let reconstructedData: any = {
      leveragePairs: {},
    };

    const queryApi = this.influxClient.getQueryApi(INFLUXDB_ORG);

    // Construct the field filter part of the query dynamically
    const fieldFilters = fields.map((field) => `r["_field"] == "${field}"`).join(' or ');
    const timeframesQuery = timeframes.map((field) => `r["timeframe"] == "${field}"`).join(' or ');
    const fluxQuery = `from(bucket: "Opportunities")
    |> range(start: ${timeRangeStart}, stop: ${timeRangeStop})
    |> filter(fn: (r) => r["_measurement"] == "pair_data")
    |> filter(fn: (r) => ${fieldFilters})
    |> filter(fn: (r) => ${timeframesQuery})
    |> filter(fn: (r) => r["pair"] == "${pairName}")
    |> yield(name: "mean")`;

    console.log('Executing Flux query:', fluxQuery); // Debug log

    const results = await new Promise((resolve, reject) => {
      const queryResults = [];
      queryApi.queryRows(fluxQuery, {
        next(row, tableMeta) {
          const o = tableMeta.toObject(row);
          queryResults.push(o);
        },
        error(error) {
          console.error('Error querying data from InfluxDB:', error);
          reject(error);
        },
        complete() {
          resolve(queryResults);
        },
      });
    });

    reconstructedData[pairName] = results.flat();

    return reconstructedData;
  }

  // Add other methods as needed
}

// Export the class for external use
export default InfluxDBWrapper;
