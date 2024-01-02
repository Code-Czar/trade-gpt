import { Response, Request, NextFunction } from 'express'
import { DataController } from '../controllers' // Import the controller
import { AbstractView } from './AbstractViews' // Import the abstract view
import { BACKEND_ENDPOINTS } from 'trading-shared' // Import the abstract view

const routesURLs = BACKEND_ENDPOINTS

export class DataView extends AbstractView {
  private dataController: DataController
  private expressApp = null
  public routes = routesURLs

  constructor(controller: DataController, app) {
    super()
    this.dataController = controller
    this.expressApp = app
    this.bindExpressRoutes()
  }

  bindExpressRoutes() {
    this.expressApp.get(
      this.routes.HEALTH,
      this.wrapAsync(this.health.bind(this)),
    )

    this.expressApp.post(
      this.routes.CLEAR_DATABASE,
      this.wrapAsync(this.clearDataBase.bind(this)),
    )

    this.expressApp.post(
      this.routes.FETCH_HISTORICAL_DATA,
      this.wrapAsync(this.fetchHistoricalData.bind(this)),
    )

    this.expressApp.post(
      this.routes.FETCH_ALL_HISTORICAL_DATA,
      this.wrapAsync(this.fetchAllHistoricalData.bind(this)),
    )

    this.expressApp.get(
      this.routes.LEVERAGE_ENDPOINTS.getLeverageSymbols,
      this.wrapAsync(this.getLeveragePairs.bind(this)),
    )

    this.expressApp.post(
      this.routes.GET_PAIR_DATA,
      this.wrapAsync(this.getPairData.bind(this)),
    )
  }

  private wrapAsync(fn: Function) {
    return (req: Request, res: Response, next: NextFunction) => {
      fn(req, res, next).catch(next)
    }
  }

  async health(req: Request, res: Response) {
    try {
      res.status(200).json({ message: 'Alive' })
    } catch (error) {
      global.logger.error('Error starting backend:', error)
      res.status(500).json({ error: 'Internal Server Error' })
    }
  }
  async clearDataBase(req: Request, res: Response) {
    try {
      await this.dataController.clearDatabase()
      res.status(200).json({ message: 'cleared database' })
    } catch (error) {
      global.logger.error('Error clearing database:', error)
      res.status(500).json({ error: 'Internal Server Error' })
    }
  }
  async fetchHistoricalData(req: Request, res: Response) {
    try {
      const { pairName, timeframes } = req.body
      console.log('🚀 ~ file: dataView.ts:73 ~ pairName:', pairName, timeframes)
      const result = await this.dataController.fetchHistoricalData(
        pairName,
        timeframes,
      )
      res.status(200).json({ pair: result })
    } catch (error) {
      global.logger.error('Error fetching historical data:', error)
      res.status(500).json({ error: 'Internal Server Error' })
    }
  }
  async fetchAllHistoricalData(req: Request, res: Response) {
    try {
      await this.dataController.fetchAllHistoricalData()
      res.status(200).json({ message: 'All data fetched' })
    } catch (error) {
      global.logger.error('Error fetching all historical data:', error)
      res.status(500).json({ error: 'Internal Server Error' })
    }
  }

  async getLeveragePairs(req: Request, res: Response) {
    try {
      const symbolsWithLeverage =
        await this.dataController.getPairsWithLeverage()
      res.status(200).json(symbolsWithLeverage)
    } catch (error) {
      console.error(error)
      res.status(500).json({ error: 'Error fetching symbols with leverage' })
    }
  }

  async getPairData(req: Request, res: Response) {
    try {
      const { pairName } = req.body
      let timeframe = null
      if (req.body.timeframe) {
        timeframe = req.body.timeframe
      }
      console.log(
        '🚀 ~ file: dataView.ts:73 ~ getPairData ~ pairName:',
        pairName,
        timeframe,
      )
      const result = await this.dataController.getPairData(pairName, timeframe)
      res.status(200).json({ pair: result })
    } catch (error) {
      global.logger.error('Error fetching historical data:', error)
      res.status(500).json({ error: 'Internal Server Error' })
    }
  }

  // Implement more methods for other routes as needed
}
