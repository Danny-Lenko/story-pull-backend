import { Router, Request, Response, NextFunction } from 'express';
import { AsyncHandler } from '../decorators/asyncHandler';

const router = Router();

class UserController {
  @AsyncHandler
  async getUsers(req: Request, res: Response, next: NextFunction) {
    // Your logic here
    next();
  }

  @AsyncHandler
  async getUserById(req: Request, res: Response, next: NextFunction) {
    // Your logic here
    next();
  }

  @AsyncHandler
  async createUser(req: Request, res: Response, next: NextFunction) {
    // Your logic here
    next();
  }

  @AsyncHandler
  async updateUser(req: Request, res: Response, next: NextFunction) {
    // Your logic here
    next();
  }

  @AsyncHandler
  async deleteUser(req: Request, res: Response, next: NextFunction) {
    // Your logic here
    next();
  }
}

const userController = new UserController();
router.get('/users', userController.getUsers);
router.get('/users/:id', userController.getUserById);
router.post('/users', userController.createUser);
router.put('/users/:id', userController.updateUser);
router.delete('/users/:id', userController.deleteUser);

export default router;
