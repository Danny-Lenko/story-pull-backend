import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';

import { environmentSettings, Logger } from './config';
import { errorHandler, ApplicationError, notFoundHandler } from './middleware/errorHandler';
import { errorLoggingMiddleware, loggingMiddleware } from './middleware/loggers';
import routes from './routes';
import { proxyMiddleware } from './proxy';

const app = express();
const port = environmentSettings.port;

app.use(cors());
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(loggingMiddleware);

app.use('/api', proxyMiddleware);
app.use('/api', routes);

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK' });
});

app.get('/', (req, res) => {
  res.json({ message: 'Welcome to the CMS API Gateway' });
});

app.get('/not-exist', (req, res, next) => {
  try {
    // throw new ApplicationError(404, 'Resource not found');
    next(new ApplicationError(404, 'Resource not found'));
  } catch (error) {
    next(error);
  }
});

app.get('/error-example', (req, res, next) => {
  next(new ApplicationError(400, 'This is a test error'));
});

app.use(errorLoggingMiddleware);

app.use(notFoundHandler);
app.use(errorHandler);

const server = app.listen(port, () => {
  console.log(`API gateway is running on port ${port}`);
});

process.on('unhandledRejection', (reason: Error) => {
  Logger.error('Unhandled Rejection:', reason);
  // Optionally, you can throw the error and let the `uncaughtException` handler deal with it
  // throw reason;
});

// Uncaught exceptions
process.on('uncaughtException', (error: Error) => {
  Logger.error('Uncaught Exception:', error);
  // Perform a graceful shutdown
  process.exit(1);
});

export { app, server };
