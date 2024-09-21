import dotenv from 'dotenv';

dotenv.config();

export const environment = process.env.NODE_ENV || 'development';

type Environment = {
  port: number | string;
  logLevel: string;
};

const config: Record<string, Environment> = {
  development: {
    port: process.env.PORT || 4000,
    logLevel: 'debug',
  },
  test: {
    port: process.env.PORT || 5000,
    logLevel: 'error',
  },
  production: {
    port: process.env.PORT || 80,
    logLevel: 'warn',
  },
};

export const environmentSettings = config[environment];
