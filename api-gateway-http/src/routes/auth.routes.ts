/* eslint-disable @typescript-eslint/no-unused-vars */
import { Router, Request, Response, NextFunction } from 'express';
import { AsyncHandler } from '../decorators/asyncHandler';
import { generateToken } from '../utils/tokenUtils';
import { ApplicationError } from '../middleware/errorHandlerMiddleware';
import { ClientProxyFactory, Transport } from '@nestjs/microservices';

const authServiceClient = ClientProxyFactory.create({
  transport: Transport.TCP,
  options: {
    host: 'localhost',
    port: 4001, // Auth Service port
  },
});

const router = Router();

class AuthController {
  @AsyncHandler
  async login(req: Request, res: Response, next: NextFunction) {
    // Your login logic here
    // Example: throw new Error('Invalid credentials');
    // res.status(200).json({ message: 'Login successful' });

    // This is a mock login. In a real scenario, you'd verify credentials against your user service.
    const { username, password } = req.body;
    if (username === 'admin' && password === 'password') {
      const token = generateToken({ id: '1', role: 'admin' });
      res.cookie('token', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production' });
      res.json({ message: 'Login successful' });
    } else {
      next(new ApplicationError(401, 'Invalid credentials'));
    }
  }

  @AsyncHandler
  async register(req: Request, res: Response, next: NextFunction) {
    // Your registration logic here

    // try {
    // const isValid = await authServiceClient.send({ cmd: 'resister' }, { req }).toPromise();
    const registered = authServiceClient.send({ cmd: 'register' }, { req: req.body }).toPromise();
    console.log('registered', registered);

    // if (!isValid) {
    //   return res.status(401).json({ message: 'Invalid token' });
    // }
    next();
    // } catch (error) {
    // return res.status(500).json({ message: 'Error validating token' });
    // }

    res.status(201).json({ message: 'User registered successfully' });
  }

  @AsyncHandler
  async logout(req: Request, res: Response, next: NextFunction) {
    // Your logout logic here
    // res.status(200).json({ message: 'Logged out successfully' });

    res.clearCookie('token');
    res.json({ message: 'Logout successful' });
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
