export default {
  auth: {
    url: process.env.AUTH_SERVICE_URL || 'http://localhost:4001',
  },
  content: {
    url: process.env.CONTENT_SERVICE_URL || 'http://localhost:4002',
  },
  user: {
    url: process.env.USER_SERVICE_URL || 'http://localhost:4003',
  },
  analytics: {
    url: process.env.ANALYTICS_SERVICE_URL || 'http://localhost:4004',
  },
  media: {
    url: process.env.MEDIA_SERVICE_URL || 'http://localhost:4005',
  },
  search: {
    url: process.env.SEARCH_SERVICE_URL || 'http://localhost:4006',
  },
};
