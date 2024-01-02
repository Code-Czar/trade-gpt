import ByBitWebSocket from './ByBitWebSocket'
import { convertTimeFrameToByBitStandard } from '../../utils/convertData'
import {
  convertTimeframeToMs,
  readableTimestamp,
  formatOHLCVForChartData,
  updateIndicators2,
  mergeOHLCVData,
} from 'trading-shared'
// import moment from 'moment'

const moment = require('moment')
const axios = require('axios')
const fs = require('fs')
const bybitAPIEndpoint = 'https://api.bybit.com/v5/market/kline'
const bybitSymbolsEndpoint = 'https://api.bybit.com/v2/public/symbols'

export class ByBitDataFetcher {
  public fetcherStatus = {
    isPublicSocketReady: false,
    isPrivateSocketReady: false,
    isFetcherReady: false,
  }
  private callbacks = {
    onPublicClientReady: this.onPublicSocketReadyCallback.bind(this),
    onPrivateClientReady: this.onPublicSocketReadyCallback.bind(this),
  }
  private bybitWebSocket

  constructor() {
    global.logger.debug(
      '🚀 ~ file: byBitDataFetcher.ts:24 ~ ByBitWebSocket:',
      ByBitWebSocket,
    )
    this.bybitWebSocket = new ByBitWebSocket(this.callbacks)
  }
  getBybitPairsWithLeverage = async () => {
    const url = bybitSymbolsEndpoint
    const response = await axios.get(url)
    const data = response.data

    const pairs_with_leverage: BasicObject[] = []

    if (data && data.result) {
      for (const item of data.result as Array<BasicObject>) {
        if (item.leverage_filter && item.leverage_filter.max_leverage) {
          pairs_with_leverage.push(item)
        }
      }
    }

    return pairs_with_leverage
  }

  public async getInitialOHLCV(
    symbolDetails: SymbolDetails,
    timeframe: string,
    limit: number = 200,
    from?: number,
    to?: number,
  ): Promise<{
    symbolDetails: SymbolDetails
    timeframe: string
    data: OHLCVData[] | null
  }> {
    const requestParams = {
      category: 'linear',
      symbol: symbolDetails.name,
      interval: convertTimeFrameToByBitStandard(timeframe), // e.g., '1m', '5m', '1h', etc.
      start: from, // Timestamp in ms for the start of the candlestick data
      end: to, // Timestamp in ms for the end of the candlestick data
      limit: limit, // Timestamp in seconds for the end of the candlestick data
    }
    try {
      // Making HTTP GET request to Bybit API
      const response = await axios.get(bybitAPIEndpoint, {
        params: requestParams,
      })

      // Logging the data
      response.data = response.data.result.list
      /*global.logger.debug("🚀 ~ file: cryptoFetcher.ts:27 ~ fetchByBitOHLCV ~ symbol:",
                {
                    name: symbolDetails.name,
                    timeframe,
                    length: response.data?.length
                }
                //  response.data
            )*/
      if (response.data) {
        response.data = response.data.map((item) => {
          return [
            parseFloat(item[0]),
            parseFloat(item[1]),
            parseFloat(item[2]),
            parseFloat(item[3]),
            parseFloat(item[4]),
            parseFloat(item[5]),
          ]
        })
      } else {
        console.error(
          '🚀 ~ file: cryptoFetcher.ts:27 ~ fetchByBitOHLCV ~ symbol:',
          {
            name: symbolDetails.name,
            timeframe,
            length: response.data?.length,
          },
          //  response.data
        )
      }

      // Returning the OHLCV data
      return { symbolDetails, timeframe, data: response.data }
    } catch (error) {
      // Handling any errors
      console.error('Error fetching OHLCV data:', error)
      return null
    }
  }

  public async getInitialOHLCVs(
    symbols: SymbolDetails[],
    timeframes: string[],
    limit: number = 200,
    from?: number,
    to?: number,
  ): Promise<Record<string, any>> {
    // global.logger.debug(
    //   '🚀 ~ file: ByBitDataFetcher.ts:5 ~ getInitialOHLCVs ~ timeframe:',
    //   timeframes,
    // )
    const fetchPromises = symbols.flatMap((symbol) =>
      timeframes.map((timeframe) => () => getInitialOHLCV(symbol, timeframe)),
    )
    // global.logger.debug(
    //   '🚀 ~ file: ByBitDataFetcher.ts:65 ~ getInitialOHLCVs ~ fetchPromises:',
    //   fetchPromises.length,
    // )
    const result = {}

    const shouldRetry = []

    while (fetchPromises.length > 0) {
      const batch = fetchPromises.splice(0, 100) // Get the next batch of 10 promises (and remove them from allPromises)
      const batchResults = await Promise.all(batch.map((fn) => fn())) // Execute current batch of promises in parallel
      batchResults.forEach((batchResult, index) => {
        const { symbolDetails, timeframe, data } = batchResult
        if (!data) {
          // global.logger.debug(
          //   '🚀 ~ file: ByBitDataFetcher.ts:82 ~ batchResults.forEach ~ data:',
          //   { name: symbolDetails.name, timeframe, data },
          // )
        }
        if (data) {
          if (!result[symbolDetails.name]) {
            result[symbolDetails.name] = {}
          }
          if (!result[symbolDetails.name][timeframe]) {
            result[symbolDetails.name][timeframe] = {}
          }
          result[symbolDetails.name][timeframe].ohlcv = data
          result[symbolDetails.name].details = symbolDetails
        }
      })

      await new Promise((resolve) => setTimeout(resolve, 1000)) // Wait 10 seconds before next batch
    }

    global.logger.debug(
      '🚀 ~ file: ByBitDataFetcher.ts:61 ~ getInitialOHLCVs ~ allResults:',
      { keys: Object.keys(result).length },
    )
    return result
  }

  private async fetchAllHistoricalDataForPair(
    inputPair,
    timeframe,
    datafetchCallback,
  ) {
    const pairData = inputPair.data?.[timeframe]
    const pairName = inputPair.details.name

    if (!pairData) {
      return Promise.resolve() // Resolve immediately if no data
    }

    console.log(
      '🚀 ~ file: dataController.ts:162 ~ fetchAllHistoricalDataForPair:',
      pairName,
      inputPair.data[timeframe][0].time,
      // inputPair.data,
    )

    // return async () => {
    // Return a function that returns a promise
    console.log(
      '🚀 ~ file: byBitDataFetcher.ts:182 ~ pairData[0].time:',
      timeframe,
      // inputPair.data['1d'][0].time,
    )
    const earliestTimestamp = inputPair.data[timeframe][0].time
    console.log(
      '🚀 ~ file: dataController.ts:166 ~ earliestTimestamp:',
      earliestTimestamp,
    )

    const timeframeMs = convertTimeframeToMs(timeframe)

    let currentTimestamp = earliestTimestamp
    const tenYearsInMilliseconds = 10 * 365 * 24 * 60 * 60 * 1000
    const startTimestamp = currentTimestamp - tenYearsInMilliseconds
    const limit = 1000
    // global.logger.debug(
    //   '🚀 ~ file: byBitDataFetcher.ts:199 ~ timeframeMs:',
    //   timeframeMs,
    // )
    console.log(
      '🚀 ~ file: byBitDataFetcher.ts:199 ~ timeframeMs:',
      timeframeMs,
    )

    while (true) {
      // Determine the timestamps for the next batch
      let batchEndTimestamp = currentTimestamp
      let batchStartTimestamp = Math.max(
        batchEndTimestamp - timeframeMs * limit,
        startTimestamp,
      )

      // Fetch the batch
      const batchData = await this.fetchBatchHistoricalDataForPair(
        inputPair,
        timeframe,
        batchStartTimestamp,
        batchEndTimestamp,
        limit,
      )

      // Handle the fetched data
      if (batchData) {
        datafetchCallback(batchData)
      } else {
        break // No more data to fetch
      }

      // Prepare for the next iteration
      currentTimestamp = batchStartTimestamp
      if (currentTimestamp === startTimestamp) {
        break // Completed fetching all data
      }
    }

    // fs.writeFileSync('storePair.json', JSON.stringify(inputPair))

    return inputPair
  }

  private async fetchBatchHistoricalDataForPair(
    inputPair,
    timeframe: string,
    startTimestamp: number,
    endTimestamp: number,
    limit = 200,
    emaPeriods = [7, 14, 28, 100, 200],
    rsiPeriods = [14, 21],
    maPeriods = [7, 14, 28, 100, 200], // Add your desired MA periods here
  ) {
    // Get symbolDetails corresponding to pairSymbol
    const storePair = inputPair
    const symbolDetails = storePair.details
    const OVERLAP_COUNT = 0 // Adjust based on your requirement

    const fetchedData = await this.getInitialOHLCV(
      symbolDetails,
      timeframe,
      limit,
      startTimestamp,
      endTimestamp,
    ) // Assuming a default limit of 200

    // global.logger.debug('🚀 ~ file: byBitDataFetcher.ts :241 ~ fetchedData:', fetchedData)
    // global.logger.debug("🚀 ~ file: byBitDataFetcher.ts :317 ~ fetchedData:", fetchedData);
    const newData = fetchedData?.data
    // const mergedOHLCVs = newData

    if (!newData || newData.length === 0) {
      return false // Exit if no more data
    }

    let mergedOHLCVs = []
    // Check if there is previously fetched data to merge
    if (
      storePair.lastFetchedOHLCV &&
      storePair.lastFetchedOHLCV.length >= OVERLAP_COUNT
    ) {
      // Get the last 'X' data points from the last fetched data
      const overlappingData = storePair.lastFetchedOHLCV.slice(-OVERLAP_COUNT)
      mergedOHLCVs = mergeOHLCVData(
        overlappingData,
        newData,
        convertTimeframeToMs(timeframe),
      ) //[...overlappingData, ...newData]
    } else {
      mergedOHLCVs = newData
    }
    const formattedData = formatOHLCVForChartData(
      mergedOHLCVs,
      symbolDetails.name,
      timeframe,
    )

    const pointsArray = await updateIndicators2(
      formattedData,
      emaPeriods,
      rsiPeriods,
      maPeriods,
    )
    // global.logger.debug(
    //   '🚀 ~ file: byBitDataFetcher.ts :343 ~ mergedIndicators:',
    //   mergedIndicators,
    // )
    // fs.writeFileSync('mergedIndicators.json', JSON.stringify(mergedIndicators))

    global.logger.info(
      '🚀 ~ file: byBitDataFetcher.ts :349 ~ pointsArray:',
      { name: symbolDetails.name, length: pointsArray.length },
      // readableTimestamp,
    )
    fs.writeFileSync('pointBatch.json', JSON.stringify(pointsArray))

    if (!storePair.lastFetchedOHLCV) {
      storePair.data[timeframe] = [...pointsArray]
    } else {
      storePair.data[timeframe] = [...storePair.data[timeframe], ...pointsArray]
    }

    // fs.writeFileSync('pointsArray_2.json', JSON.stringify(pointsArray))

    const fromTimeStamp = readableTimestamp(pointsArray[0].timestamp)
    const toTimeStamp = readableTimestamp(
      pointsArray[pointsArray.length - 1].timestamp,
    )
    global.logger.debug(
      '🚀 ~ file: byBitDataFetcher.ts :349 ~ pointsArray:',
      fromTimeStamp,
      toTimeStamp,
      storePair.data[timeframe].length,
    )
    // fs.writeFileSync('storePair.json', JSON.stringify(storePair))
    // await this.writePointsArrayToDatabase(pointsArray)
    storePair.lastFetchedOHLCV = mergedOHLCVs.slice(0, limit)
    // this.dataStore.get(PAIR_TYPES.leveragePairs).set(pairSymbol, storePair)

    return pointsArray
  }

  public setUpdateOHLCVCallback(callback: (...args: any[]) => void): void {
    this.bybitWebSocket.webSocketSetOHLCVsUpdateCallback(callback)
  }

  public setReconnectCallback(callback: (...args: any[]) => void): void {
    this.bybitWebSocket.setReconnectCallback(callback)
  }

  public async registerToAllOHLCVDataUpdates(
    symbolNames: string[],
    timeframes: string[],
    callback: (...args: any[]) => void,
  ): Promise<void> {
    this.bybitWebSocket.webSocketRegisterToAllOHLCVDataUpdates(
      symbolNames,
      timeframes,
      callback,
    )
  }

  public async registerToOHLCVDataUpdates(
    symbolName: string,
    timeframe: string,
  ): Promise<void> {
    this.bybitWebSocket.webSocketRegisterToOHLCVDataForPair(
      symbolName,
      timeframe,
    )
  }

  public onPublicSocketReadyCallback(socketStatus: boolean) {
    this.fetcherStatus.isPublicSocketReady = socketStatus
    this.fetcherStatus.isFetcherReady = this.fetcherStatus.isPublicSocketReady
  }
  public onPrivateSocketReadyCallback(socketStatus: boolean) {
    this.fetcherStatus.isPrivateSocketReady = socketStatus
  }

  public isReady() {
    return this.fetcherStatus.isFetcherReady
  }
}

export default ByBitDataFetcher
