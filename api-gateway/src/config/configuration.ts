export default () => ({
  TCP_PORT: parseInt(process.env.AUTH_SERVICE_PORT, 10) || 4000,
  HTTP_PORT: parseInt(process.env.AUTH_SERVICE_HTTP_PORT, 10) || 5000,

  AUTH_SERVICE_HOST: process.env.AUTH_SERVICE_HOST || 'localhost',
  AUTH_SERVICE_PORT: parseInt(process.env.AUTH_SERVICE_PORT, 10) || 4001,
  AUTH_SERVICE_URL: process.env.AUTH_SERVICE_URL || 'http://localhost:4001',

  CONTENT_SERVICE_HOST: process.env.CONTENT_SERVICE_HOST || 'localhost',
  CONTENT_SERVICE_PORT: parseInt(process.env.CONTENT_SERVICE_PORT, 10) || 4002,
  CONTENT_SERVICE_URL: process.env.CONTENT_SERVICE_URL || 'http://localhost:4002',

  USER_SERVICE_URL: process.env.USER_SERVICE_URL || 'http://localhost:4003',
  ANALYTICS_SERVICE_URL: process.env.ANALYTICS_SERVICE_URL || 'http://localhost:4004',
  MEDIA_SERVICE_URL: process.env.MEDIA_SERVICE_URL || 'http://localhost:4005',
  SEARCH_SERVICE_URL: process.env.SEARCH_SERVICE_URL || 'http://localhost:4006',

  MONGODB_URI: process.env.MONGODB_URI,
  JWT_SECRET: process.env.JWT_SECRET,
  JWT_EXPIRATION: process.env.JWT_EXPIRATION || '1h',
  REDIS_URL: process.env.REDIS_URL,
});
