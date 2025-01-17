import request from 'supertest';
import { app, server } from '../src/server'; // Adjust this import path as necessary

describe('API Gateway Routing', () => {
  afterAll(() => {
    server.close(); // Close the server after tests complete
  });

  it('should return 503 for unavailable auth service', async () => {
    const response = await request(app).post('/api/auth/login');
    expect(response.status).toBe(503);
    expect(response.body).toEqual({
      status: 'error',
      statusCode: 503,
      message: 'Service Unavailable: auth',
    });
  });

  it('should return 503 for unavailable analytics service', async () => {
    const response = await request(app).get('/api/analytics/content');
    expect(response.status).toBe(503);
    expect(response.body).toEqual({
      status: 'error',
      statusCode: 503,
      message: 'Service Unavailable: analytics',
    });
  });

  it('should return 503 for unavailable content service', async () => {
    const response = await request(app).get('/api/content');
    expect(response.status).toBe(503);
    expect(response.body).toEqual({
      status: 'error',
      statusCode: 503,
      message: 'Service Unavailable: content',
    });
  });

  it('should return 503 for unavailable content service', async () => {
    const response = await request(app).get('/api/content');
    expect(response.status).toBe(503);
    expect(response.body).toEqual({
      status: 'error',
      statusCode: 503,
      message: 'Service Unavailable: content',
    });
  });

  it('should return 503 for unavailable media service', async () => {
    const response = await request(app).get('/api/media');
    expect(response.status).toBe(503);
    expect(response.body).toEqual({
      status: 'error',
      statusCode: 503,
      message: 'Service Unavailable: media',
    });
  });

  it('should return 503 for unavailable search service', async () => {
    const response = await request(app).get('/api/search');
    expect(response.status).toBe(503);
    expect(response.body).toEqual({
      status: 'error',
      statusCode: 503,
      message: 'Service Unavailable: search',
    });
  });

  it('should return 503 for unavailable user service', async () => {
    const response = await request(app).get('/api/user');
    expect(response.status).toBe(503);
    expect(response.body).toEqual({
      status: 'error',
      statusCode: 503,
      message: 'Service Unavailable: user',
    });
  });

  // Add similar tests for other services (user, analytics, media, search)

  it('should return 404 for unrecognized service', async () => {
    const response = await request(app).get('/api/nonexistent/endpoint');
    expect(response.status).toBe(404);
    expect(response.body).toEqual({
      status: 'error',
      statusCode: 404,
      message: 'Not Found - /api/nonexistent/endpoint',
    });
  });
});
