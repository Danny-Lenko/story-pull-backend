import { Request, Response, NextFunction } from 'express';
import { environmentSettings } from '../config';

export class AppError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public isOperational = true,
    public stack = '',
  ) {
    super(message);
    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

export const errorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction,
) => {
  const status = err instanceof AppError ? err.statusCode : 500;
  const message = err.message || 'Internal Server Error';

  // Log the error
  console.error(`[${new Date().toISOString()}] ${status} - ${message}`);

  // Don't leak error details in production
  // const error = environmentSettings.logLevel === 'debug' ? err : {};

  res.status(status).json({
    error: {
      message,
      ...(environmentSettings.logLevel === 'debug' && { stack: err.stack }),
    },
  });
};
