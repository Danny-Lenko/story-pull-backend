export default () => ({
  AUTH_SERVICE_PORT: parseInt(process.env.AUTH_SERVICE_PORT, 10) || 4000,
  AUTH_SERVICE_HTTP_PORT: parseInt(process.env.AUTH_SERVICE_HTTP_PORT, 10) || 4001,
  MONGODB_URI: process.env.MONGODB_URI,
  JWT_SECRET: process.env.JWT_SECRET,
  JWT_EXPIRATION: process.env.JWT_EXPIRATION || '1h',
});
