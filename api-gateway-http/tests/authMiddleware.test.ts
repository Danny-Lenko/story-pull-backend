import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { authMiddleware, AuthenticatedRequest } from '../src/middleware/authMiddleware';
import { ApplicationError } from '../src/middleware/errorHandlerMiddleware';
import { environmentSettings } from '../src/config';
import { server } from '../src/server';

jest.mock('jsonwebtoken');
jest.mock('../src/config', () => ({
  environmentSettings: {
    jwtSecret: 'test-secret',
  },
  services: {
    auth: { url: 'http://auth-service' },
    content: { url: 'http://content-service' },
    user: { url: 'http://user-service' },
    analytics: { url: 'http://analytics-service' },
    media: { url: 'http://media-service' },
    search: { url: 'http://search-service' },
  },
}));

describe('authMiddleware', () => {
  let mockRequest: Partial<AuthenticatedRequest>;
  let mockResponse: Partial<Response>;
  let nextFunction: NextFunction;

  afterAll(() => {
    server.close(); // Close the server after tests complete
  });

  beforeEach(() => {
    mockRequest = {
      cookies: {},
    };
    mockResponse = {};
    nextFunction = jest.fn();
  });

  it('should call next with an error if no token is provided', () => {
    authMiddleware(mockRequest as AuthenticatedRequest, mockResponse as Response, nextFunction);

    expect(nextFunction).toHaveBeenCalledWith(expect.any(ApplicationError));
    const error = (nextFunction as jest.Mock).mock.calls[0][0] as ApplicationError;
    expect(error.statusCode).toBe(401);
    expect(error.message).toBe('Authentication required');
  });

  it('should call next with an error if an invalid token is provided', () => {
    mockRequest.cookies = { token: 'invalid-token' };
    (jwt.verify as jest.Mock).mockImplementation(() => {
      throw new Error('Invalid token');
    });

    authMiddleware(mockRequest as AuthenticatedRequest, mockResponse as Response, nextFunction);

    expect(nextFunction).toHaveBeenCalledWith(expect.any(ApplicationError));
    const error = (nextFunction as jest.Mock).mock.calls[0][0] as ApplicationError;
    expect(error.statusCode).toBe(401);
    expect(error.message).toBe('Invalid or expired token');
  });

  it('should set req.user and call next if a valid token is provided', () => {
    const mockUser = { id: '123', role: 'admin' };
    mockRequest.cookies = { token: 'valid-token' };
    (jwt.verify as jest.Mock).mockReturnValue(mockUser);

    authMiddleware(mockRequest as AuthenticatedRequest, mockResponse as Response, nextFunction);

    expect(mockRequest.user).toEqual(mockUser);
    expect(nextFunction).toHaveBeenCalledWith();
  });

  it('should use the correct secret key from environmentSettings', () => {
    mockRequest.cookies = { token: 'valid-token' };
    (jwt.verify as jest.Mock).mockReturnValue({ id: '123', role: 'admin' });

    authMiddleware(mockRequest as AuthenticatedRequest, mockResponse as Response, nextFunction);

    expect(jwt.verify).toHaveBeenCalledWith('valid-token', environmentSettings.jwtSecret);
  });
});
