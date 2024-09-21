import { Router, Request, Response, NextFunction } from 'express';
import { AsyncHandler } from '../decorators/asyncHandler';

const router = Router();

class MediaController {
  @AsyncHandler
  async uploadMedia(req: Request, res: Response, next: NextFunction) {
    // Your logic here
    next();
  }

  @AsyncHandler
  async getMediaById(req: Request, res: Response, next: NextFunction) {
    // Your logic here
    next();
  }

  @AsyncHandler
  async deleteMedia(req: Request, res: Response, next: NextFunction) {
    // Your logic here
    next();
  }
}

const mediaController = new MediaController();
router.post('/media/upload', mediaController.uploadMedia);
router.get('/media/:id', mediaController.getMediaById);
router.delete('/media/:id', mediaController.deleteMedia);

export default router;
