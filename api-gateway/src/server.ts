import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';

import { environmentSettings } from './config';
import { errorHandler, AppError } from './middleware/errorHandler';
import { errorLoggingMiddleware, loggingMiddleware } from './middleware/loggers';

const app = express();
const port = environmentSettings.port;

app.use(cors());
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(loggingMiddleware);

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK' });
});

app.get('/', (req, res) => {
  res.json({ message: 'Welcome to the CMS API Gateway' });
});

app.get('/not-exist', (req, res, next) => {
  try {
    throw new AppError(404, 'Resource not found');
  } catch (error) {
    next(error);
  }
});

app.get('/error-example', (req, res, next) => {
  next(new AppError(400, 'This is a test error'));
});

app.use(errorLoggingMiddleware);

app.use(errorHandler);

const server = app.listen(port, () => {
  console.log(`API gateway is running on port ${port}`);
});

export { app, server };
