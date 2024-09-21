/* eslint-disable @typescript-eslint/no-unused-vars */
import { Router, Request, Response, NextFunction } from 'express';
import { AsyncHandler } from '../decorators/asyncHandler';
const router = Router();

class AuthController {
  @AsyncHandler
  async login(req: Request, res: Response, next: NextFunction) {
    // Your login logic here
    // Example: throw new Error('Invalid credentials');
    res.status(200).json({ message: 'Login successful' });
  }

  @AsyncHandler
  async register(req: Request, res: Response, next: NextFunction) {
    // Your registration logic here
    res.status(201).json({ message: 'User registered successfully' });
  }

  @AsyncHandler
  async logout(req: Request, res: Response, next: NextFunction) {
    // Your logout logic here
    res.status(200).json({ message: 'Logged out successfully' });
  }

  @AsyncHandler
  async refreshToken(req: Request, res: Response, next: NextFunction) {
    // Your token refresh logic here
    res.status(200).json({ message: 'Token refreshed successfully' });
  }
}

const authController = new AuthController();
router.post('/login', authController.login);
router.post('/register', authController.register);
router.post('/logout', authController.logout);
router.post('/refresh-token', authController.refreshToken);

export default router;
