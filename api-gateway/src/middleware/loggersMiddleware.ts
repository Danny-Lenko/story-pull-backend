import { Request, Response, NextFunction } from 'express';
import { Logger } from '../config';

export const loggingMiddleware = (req: Request, res: Response, next: NextFunction) => {
  Logger.http(`${req.method} ${req.url}`);
  next();
};

export const errorLoggingMiddleware = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  Logger.error(`${err.message} - ${req.method} ${req.url}`);
  next(err);
};
