import dotenv from 'dotenv';

dotenv.config();

export const environment = process.env.NODE_ENV || 'development';

type Environment = {
  port: number | string;
  logLevel: string;
  jwtSecret: string;
  jwtExpiresIn: string;
};

const config: Record<string, Environment> = {
  development: {
    port: process.env.PORT || 4000,
    logLevel: 'debug',
    jwtSecret: process.env.JWT_SECRET || 'your-default-secret-key',
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || '1h',
  },
  test: {
    port: process.env.PORT || 5000,
    logLevel: 'error',
    jwtSecret: process.env.JWT_SECRET || 'your-default-secret-key',
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || '1h',
  },
  production: {
    port: process.env.PORT || 80,
    logLevel: 'warn',
    jwtSecret: process.env.JWT_SECRET || 'your-default-secret-key',
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || '1h',
  },
};

export const environmentSettings = config[environment];
