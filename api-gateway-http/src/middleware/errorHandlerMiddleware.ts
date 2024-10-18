import { Request, Response, NextFunction } from 'express';
import { Logger } from '../config';

export interface AppError extends Error {
  statusCode: number;
  isOperational: boolean;
}

export class ApplicationError extends Error implements AppError {
  public name: string;

  constructor(
    public statusCode: number,
    public message: string,
    public isOperational = true,
    public stack = '',
  ) {
    super(message);
    this.name = this.constructor.name;
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
  const statusCode = (err as AppError).statusCode || 500;
  const isOperational = (err as AppError).isOperational || false;
  const message = err.message || 'Internal Server Error';

  // Log the error
  Logger.error(`Error: ${message}`, {
    statusCode,
    stack: err.stack,
    isOperational,
    path: req.path,
    method: req.method,
  });

  res.status(statusCode).json({
    status: 'error',
    statusCode,
    message: statusCode === 500 ? 'Internal Server Error' : message,
  });
};

export const notFoundHandler = (req: Request, res: Response, next: NextFunction) => {
  const err = new Error(`Not Found - ${req.originalUrl}`) as AppError;
  err.statusCode = 404;
  err.isOperational = true;
  next(err);
};

export class ServiceUnavailableError extends Error implements AppError {
  statusCode: number;
  isOperational: boolean;

  constructor(serviceName: string) {
    super(`Service Unavailable: ${serviceName}`);
    this.name = 'ServiceUnavailableError';
    this.statusCode = 503;
    this.isOperational = true;
  }
}
