import { Response, Request, NextFunction } from 'express';
import { BacktestingController } from '@/controllers'; // Import the controller
import { AbstractView } from './AbstractView'; // Import the abstract view
import { STRATEGY_ANALYZER_ENDPOINTS } from 'trading-shared'; // Import the abstract view

const routesURLs = STRATEGY_ANALYZER_ENDPOINTS.BACKTESTING;

export class BacktestingView extends AbstractView {
  private backtestingController: BacktestingController;
  private expressApp = null;
  public routes = routesURLs;

  constructor(controller: BacktestingController, app) {
    super();
    this.backtestingController = controller;
    this.expressApp = app;
    this.bindExpressRoutes();
  }

  bindExpressRoutes() {
    // Route to start backtesting
    this.expressApp.post(this.routes.startBacktest, this.wrapAsync(this.startBacktest.bind(this)));

    // Route to get backtest results
    this.expressApp.get(this.routes.getBacktestResults, this.wrapAsync(this.getBacktestResults.bind(this)));

    // Add more routes bindings as needed
  }

  private wrapAsync(fn: Function) {
    return (req: Request, res: Response, next: NextFunction) => {
      fn(req, res, next).catch(next);
    };
  }

  async startBacktest(req: Request, res: Response) {
    try {
      const backtestParams = req.body; // Extract backtesting parameters from request body
      const result = await this.backtestingController.startBacktest(backtestParams);
      res.status(200).json(result);
    } catch (error) {
      global.logger.error('Error starting backtest:', error);
      res.status(500).json({ error: 'Internal Server Error' });
      throw error;
    }
  }

  async getBacktestResults(req: Request, res: Response) {
    try {
      const { backtestId } = req.query; // Extract backtest ID from query params
      const results = await this.backtestingController.getBacktestResults(backtestId);
      res.status(200).json(results);
    } catch (error) {
      console.error('Error getting backtest results:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  // Implement more methods for other routes as needed
}
