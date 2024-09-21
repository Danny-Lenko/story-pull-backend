import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';

import { environmentSettings, Logger } from './config';
import {
  errorHandler,
  ApplicationError,
  notFoundHandler,
} from './middleware/errorHandlerMiddleware';
import { errorLoggingMiddleware, loggingMiddleware } from './middleware/loggersMiddleware';
import routes from './routes';
import { proxyMiddleware } from './proxy';
import { authMiddleware } from './middleware/authMiddleware';
// import { generateToken } from './utils/tokenUtils';

const app = express();
const port = environmentSettings.port;

app.use(cors());
app.use(cookieParser());
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

app.get('/error-example', (req, res, next) => {
  next(new ApplicationError(400, 'This is a test error'));
});

app.get('/protected', authMiddleware, (req, res) => {
  res.json({ message: 'This is a protected route' });
});

// app.get('/login', (req, res, next) => {
//   const mockUser = { username: 'admin', password: 'password' };
//   const { username, password } = mockUser;
//   if (username === 'admin' && password === 'password') {
//     const token = generateToken({ id: '1', role: 'admin' });
//     res.cookie('token', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production' });
//     res.json({ message: 'Login successful' });
//   } else {
//     next(new ApplicationError(401, 'Invalid credentials'));
//   }
// });

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
