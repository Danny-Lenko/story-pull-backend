export default () => ({
  MEDIA_SERVICE_PORT: parseInt(process.env.MEDIA_SERVICE_PORT, 10) || 4003,
  MEDIA_SERVICE_HTTP_PORT: parseInt(process.env.MEDIA_SERVICE_HTTP_PORT, 10) || 5003,

  UPLOAD_DIR: process.env.UPLOAD_DIR || '../shared/uploads',

  MONGODB_URI: process.env.MONGODB_URI,
  JWT_SECRET: process.env.JWT_SECRET,
  JWT_EXPIRATION: process.env.JWT_EXPIRATION || '1h',
  REDIS_URL: process.env.REDIS_URL,

  AUTH_SERVICE_HOST: process.env.AUTH_SERVICE_HOST || 'localhost',
  AUTH_SERVICE_PORT: parseInt(process.env.AUTH_SERVICE_PORT, 10) || 4001,
});
