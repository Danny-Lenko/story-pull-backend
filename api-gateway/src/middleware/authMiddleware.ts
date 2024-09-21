import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { environmentSettings } from '../config';
import { ApplicationError } from './errorHandlerMiddleware';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    role: string;
  };
}

export const authMiddleware = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const token = req.cookies.token;

  if (!token) {
    next(new ApplicationError(401, 'Authentication required'));
  }

  try {
    const decoded = jwt.verify(token, environmentSettings.jwtSecret) as {
      id: string;
      role: string;
    };
    req.user = decoded;
    next();
  } catch {
    next(new ApplicationError(401, 'Invalid or expired token'));
  }
};
