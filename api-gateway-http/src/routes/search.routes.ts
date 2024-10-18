import { Router, Request, Response, NextFunction } from 'express';
import { AsyncHandler } from '../decorators/asyncHandler';

const router = Router();

class SearchController {
  @AsyncHandler
  async search(req: Request, res: Response, next: NextFunction) {
    // Your logic here
    next();
  }

  @AsyncHandler
  async indexSearch(req: Request, res: Response, next: NextFunction) {
    // Your logic here
    next();
  }
}

const searchController = new SearchController();
router.get('/search', searchController.search);
router.post('/search/index', searchController.indexSearch);

export default router;
