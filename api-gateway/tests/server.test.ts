import request from 'supertest';
import { app, server } from '../src/server';

describe('Express Server', () => {
  afterAll(() => {
    server.close(); // Close the server after tests complete
  });

  it('should respond to health check', async () => {
    const response = await request(app).get('/health');
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ status: 'OK' });
  });

  it('should respond with welcome message on root route', async () => {
    const response = await request(app).get('/');
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ message: 'Welcome to the CMS API Gateway' });
  });

  it('should handle non-existent routes', async () => {
    const response = await request(app).get('/not-exist');
    expect(response.status).toBe(404);
    expect(response.body).toEqual({
      status: 'error',
      statusCode: 404,
      message: 'Resource not found',
    });
  });

  it('should handle errors', async () => {
    const response = await request(app).get('/error-example');
    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      status: 'error',
      statusCode: 400,
      message: 'This is a test error',
    });
  });
});
