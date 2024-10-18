import { Router, Request, Response, NextFunction } from 'express';
import { AsyncHandler } from '../decorators/asyncHandler';

const router = Router();

class ContentController {
  @AsyncHandler
  async getContent(req: Request, res: Response, next: NextFunction) {
    // Your logic here
    next();
  }

  @AsyncHandler
  async getContentById(req: Request, res: Response, next: NextFunction) {
    // Your logic here
    next();
  }

  @AsyncHandler
  async createContent(req: Request, res: Response, next: NextFunction) {
    // Your logic here
    next();
  }

  @AsyncHandler
  async updateContent(req: Request, res: Response, next: NextFunction) {
    // Your logic here
    next();
  }

  @AsyncHandler
  async deleteContent(req: Request, res: Response, next: NextFunction) {
    // Your logic here
    next();
  }
}

const contentController = new ContentController();
router.get('/content', contentController.getContent);
router.get('/content/:id', contentController.getContentById);
router.post('/content', contentController.createContent);
router.put('/content/:id', contentController.updateContent);
router.delete('/content/:id', contentController.deleteContent);

export default router;
