import { Express, Request, Response } from 'express';
import { StrategyManagerController } from '../controllers/strategyManagerController';

export class StrategyManagerView {
  constructor(private strategyManagerController: StrategyManagerController, app: Express) {
    this.setupRoutes(app);
  }

  private setupRoutes(app: Express): void {
    app.get('/strategies', this.getStrategies.bind(this));
    // Add more routes as needed
  }

  private getStrategies(req: Request, res: Response): void {
    this.strategyManagerController.getStrategies(req, res);
  }

  // Additional methods for handling other requests related to strategies
}
