import { Router, Request, Response, NextFunction } from 'express';
import { AsyncHandler } from '../decorators/asyncHandler';

const router = Router();

class AnalyticsController {
  @AsyncHandler
  async getContentAnalytics(req: Request, res: Response, next: NextFunction) {
    // Your logic here
    next();
  }

  @AsyncHandler
  async getUserAnalytics(req: Request, res: Response, next: NextFunction) {
    // Your logic here
    next();
  }

  @AsyncHandler
  async getPerformanceAnalytics(req: Request, res: Response, next: NextFunction) {
    // Your logic here
    next();
  }
}

const analyticsController = new AnalyticsController();
router.get('/analytics/content', analyticsController.getContentAnalytics);
router.get('/analytics/users', analyticsController.getUserAnalytics);
router.get('/analytics/performance', analyticsController.getPerformanceAnalytics);

export default router;
