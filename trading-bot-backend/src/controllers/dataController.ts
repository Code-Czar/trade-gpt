import { DataView } from '../views'
import { DataStore, WebsocketStreamer, ByBitDataFetcher } from '../models'
import {
  InfluxDBWrapper,
  indicators,
  formatOHLCVForChartData,
  convertBybitTimeFrameToLocal,
  convertTimeframeToMs,
  getStartOfTimeframe,
  updateIndicators2,
} from 'trading-shared'

const fs = require('fs')

const ACTIVE_TIMEFRAMES = ['1d', '1h', '5m', '1m']

export class DataController {
  private view: DataView
  private expressApp = null
  private dataFetcher: ByBitDataFetcher | any
  private dataFetchers = {
    bybit: new ByBitDataFetcher(),
  }
  private dataStore = new DataStore()
  private databaseWrapper = new InfluxDBWrapper()
  private websocketStreamer: WebsocketStreamer

  public isUpdating = false
  public isInitialized = false

  constructor(app, server, dataFetcher = 'bybit') {
    this.expressApp = app
    this.view = new DataView(this, app)
    this.dataFetcher = this.dataFetchers[dataFetcher]
    this.websocketStreamer = new WebsocketStreamer(server)
  }

  async getView() {
    return this.view
  }

  async init() {
    this.isInitialized = false
    this.isUpdating = true
    this.dataFetcher.setReconnectCallback(this.init.bind(this))

    await this.getPairsWithLeverage()
    await this.getPairsDataAndRegisterUpdates()
  }

  async clearDatabase() {
    console.log('🚀 ~ file: dataController.ts:42 ~ clearDatabase:')
    this.databaseWrapper.clearBucketData()
  }

  async getPairsWithLeverage() {
    try {
      const leveragePairs = await this.dataFetcher.getBybitPairsWithLeverage()

      this.dataStore.setLeveragePairs(leveragePairs)
      return leveragePairs
    } catch (error) {
      global.logger.error('Error getBybitPairsWithLeverage:', error)
    }
  }
  async getPairsDataAndRegisterUpdates(timeframes = ACTIVE_TIMEFRAMES) {
    const dataFetcher = this.dataFetcher

    while (!dataFetcher?.isReady()) {
      await new Promise((resolve) => setTimeout(resolve, 10))
    }
    this.dataFetcher.setUpdateOHLCVCallback(this.handleNewOHLCVsData.bind(this))

    this.isUpdating = true

    const leveragePairs = await dataFetcher.getBybitPairsWithLeverage()

    const fetchPromises = []

    leveragePairs.forEach((symbol) => {
      timeframes.forEach((timeframe) => {
        fetchPromises.push(async () => {
          const result = await dataFetcher.getInitialOHLCV(symbol, timeframe)
          const convertedData = await formatOHLCVForChartData(
            result.data,
            symbol.name,
            timeframe,
          )

          if (result && result.data) {
            const inputData = {
              details: result.symbolDetails,
              data: {
                [timeframe]: convertedData,
              },
              timeframe,
            }

            const pointsArray =
              await indicators.updateIndicators2(convertedData)

            inputData.data[timeframe] = pointsArray
            global.logger.debug(
              '🚀 ~ file: dataController.ts:81 ~ result.data:',
              inputData.details.name,
              timeframe,
            )
            // fs.writeFileSync('pointsArraBack.json', JSON.stringify(pointsArray))

            const storePair =
              await this.dataStore.setLeveragePairData(inputData)
            const res = await this.databaseWrapper.pushNewDataToDB(pointsArray)

            await this.dataFetcher.registerToOHLCVDataUpdates(
              symbol.name,
              timeframe,
            )
          }
        })
      })
    })

    const batchProcessingAmount = 100
    while (fetchPromises.length > 0) {
      const batch = fetchPromises.splice(0, batchProcessingAmount)
      await Promise.all(batch.map((fn) => fn()))

      await new Promise((resolve) => setTimeout(resolve, 1000))
    }

    global.logger.info(
      'Data store populated and subscriptions set up for all leverage pairs.',
    )

    this.isUpdating = false
    this.isInitialized = true
  }

  async fetchHistoricalData(pairName, timeframes = ACTIVE_TIMEFRAMES) {
    try {
      console.log(
        '🚀 ~ file: dataController.ts:124 ~ pairName:',
        pairName,
        timeframes,
      )
      const leveragePairs = await this.dataStore.getLeveragePairs()
      await this.fetchHistoricalDataForSinglePair(
        pairName,
        leveragePairs[pairName],
        timeframes,
      )
      return leveragePairs[pairName]
    } catch (error) {
      console.log('🚀 ~ file: dataController.ts:148 ~ error:', error)
    }
  }

  async fetchAllHistoricalData() {
    const leveragePairs = await this.dataStore.getLeveragePairs()
    const pairEntries = Object.entries(leveragePairs)

    for (const [pairName, pairData] of pairEntries) {
      await this.fetchHistoricalDataForSinglePair(pairName, pairData)
    }

    global.logger.info('All historical data fetched.')
  }

  async fetchHistoricalDataForSinglePair(
    pairName,
    pairData,
    timeframes = ACTIVE_TIMEFRAMES,
  ) {
    if (this.isUpdating || !this.isInitialized) {
      global.logger.info(
        'Waiting for initialization or current update to finish...',
      )
      await new Promise((resolve) => setTimeout(resolve, 1000))
      return this.fetchHistoricalDataForSinglePair(
        pairName,
        pairData,
        timeframes,
      )
    }

    this.isUpdating = true

    console.log('🚀 ~ file: dataController.ts:154 ~ timeframes:', timeframes)

    const promises = timeframes.map((timeframe) =>
      this.dataFetcher.fetchAllHistoricalDataForPair(
        pairData,
        timeframe,
        this.databaseWrapper.pushNewDataToDB.bind(this.databaseWrapper),
      ),
    )

    await Promise.all(promises)

    this.isUpdating = false
    global.logger.info(`Historical data fetched for ${pairName}.`)
  }

  async handleNewOHLCVsData(eventData) {
    const symbolName = eventData.topic.split('.')[2]
    const timeframeStr = eventData.topic.split('.')[1]
    const timeframe = convertBybitTimeFrameToLocal(timeframeStr)
    const timeframeMs = convertTimeframeToMs(timeframe)

    const dataValues = eventData.data.map((item) => {
      return {
        timeframe,
        pairName: symbolName,
        time: parseFloat(item.timestamp),
        open: parseFloat(item.open),
        high: parseFloat(item.high),
        low: parseFloat(item.low),
        close: parseFloat(item.close),
        volume: parseFloat(item.volume),
      }
    })

    const leveragePairs = this.dataStore.pairs.leveragePairs

    if (
      !leveragePairs[symbolName] ||
      !leveragePairs[symbolName].data ||
      !leveragePairs[symbolName].data[timeframe]
    ) {
      global.logger.error(
        `No data found for ${symbolName} in timeframe ${timeframe}`,
      )
      return
    }

    let ohlcvs = leveragePairs[symbolName].data[timeframe]

    dataValues.forEach((newItem) => {
      const lastCandleStartTime = getStartOfTimeframe(
        ohlcvs[ohlcvs.length - 1].time,
        timeframeMs,
      )
      const newItemStartTime = getStartOfTimeframe(newItem.time, timeframeMs)

      if (lastCandleStartTime === newItemStartTime) {
        ohlcvs[ohlcvs.length - 1] = newItem
      } else {
        ohlcvs.push(newItem)
      }
    })

    ohlcvs = await updateIndicators2(ohlcvs.slice(-200))

    leveragePairs[symbolName].data[timeframe] = ohlcvs.slice(-200)

    this.databaseWrapper?.pushNewDataToDB(ohlcvs.slice(-dataValues.length))
    this.websocketStreamer.broadcast(`getRealTimeData`, {
      storePair: leveragePairs[symbolName],
      timeframe,
    })
  }

  async getPairData(pairName, timeframe = null, pairType = 'leveragePairs') {
    if (!timeframe) {
      return this.dataStore.pairs[pairType][pairName]
    } else {
      const { details } = this.dataStore.pairs[pairType][pairName]
      const pairTimeframeData =
        this.dataStore.pairs[pairType][pairName].data[timeframe]
      return { details, data: { [timeframe]: pairTimeframeData } }
    }
  }
}
