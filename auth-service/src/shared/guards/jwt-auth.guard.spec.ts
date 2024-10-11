import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionContext } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { RpcException } from '@nestjs/microservices';
import { JwtAuthGuard } from './jwt-auth.guard';
import { TokenExpiredError, JsonWebTokenError } from 'jsonwebtoken';
import Redis from 'ioredis';

jest.mock('@nestjs-modules/ioredis', () => ({
  InjectRedis: () => jest.fn(),
}));

describe('JwtAuthGuard', () => {
  let guard: JwtAuthGuard;
  let jwtService: jest.Mocked<JwtService>;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let redisClient: jest.Mocked<Redis>;

  const mockRedisClient = {
    get: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JwtAuthGuard,
        {
          provide: JwtService,
          useValue: {
            verify: jest.fn(),
          },
        },
        {
          provide: Redis,
          useValue: mockRedisClient,
        },
      ],
    }).compile();

    guard = module.get<JwtAuthGuard>(JwtAuthGuard);
    jwtService = module.get(JwtService) as jest.Mocked<JwtService>;
    redisClient = module.get(Redis);
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  describe('canActivate', () => {
    let mockContext: jest.Mocked<ExecutionContext>;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let mockRpcContext: any;

    beforeEach(() => {
      mockRpcContext = {
        getData: jest.fn(),
        getContext: jest.fn().mockReturnValue({}),
      };
      mockContext = {
        switchToRpc: jest.fn().mockReturnValue(mockRpcContext),
      } as unknown as jest.Mocked<ExecutionContext>;
    });

    it('should throw RpcException if no token is provided', async () => {
      mockRpcContext.getData.mockReturnValue({});

      await expect(() => guard.canActivate(mockContext)).rejects.toThrow(RpcException);
      await expect(() => guard.canActivate(mockContext)).rejects.toThrow('No token provided');
    });

    it('should return true for a valid token', async () => {
      const mockToken = 'valid.token.here';
      const mockPayload = { sub: '123', email: 'test@example.com' };
      mockRpcContext.getData.mockReturnValue({ token: mockToken });
      jwtService.verify.mockReturnValue(mockPayload);

      const result = await guard.canActivate(mockContext);

      expect(result).toBe(true);
      expect(jwtService.verify).toHaveBeenCalledWith(mockToken);
      expect(mockRpcContext.getContext().user).toEqual(mockPayload);
    });

    it('should throw RpcException with TOKEN_EXPIRED code for expired token', async () => {
      const mockToken = 'expired.token.here';
      mockRpcContext.getData.mockReturnValue({ token: mockToken });
      jwtService.verify.mockImplementation(() => {
        throw new TokenExpiredError('jwt expired', new Date());
      });

      await expect(guard.canActivate(mockContext)).rejects.toThrow(RpcException);
      await expect(guard.canActivate(mockContext)).rejects.toThrow('Token has expired');
      try {
        await guard.canActivate(mockContext);
      } catch (error) {
        expect(error).toBeInstanceOf(RpcException);
        expect(error.getError()).toEqual({
          message: 'Token has expired',
          code: 'TOKEN_EXPIRED',
        });
      }
    });
    //   jwtService.verify.mockReturnValue({ userId: 'user123' });
    //   mockRedisClient.get.mockResolvedValue('true');

    //   await expect(guard.canActivate(mockContext)).rejects.toThrow(RpcException);
    //   expect(mockRedisClient.get).toHaveBeenCalledWith('blacklist:valid.jwt.token');
    // });

    it('should throw RpcException with INVALID_TOKEN code for invalid token', async () => {
      const mockToken = 'invalid.token.here';
      mockRpcContext.getData.mockReturnValue({ token: mockToken });
      jwtService.verify.mockImplementation(() => {
        throw new JsonWebTokenError('invalid token');
      });

      await expect(guard.canActivate(mockContext)).rejects.toThrow(RpcException);
      await expect(guard.canActivate(mockContext)).rejects.toThrow('Invalid token');
      try {
        await guard.canActivate(mockContext);
      } catch (error) {
        expect(error).toBeInstanceOf(RpcException);
        expect(error.getError()).toEqual({
          message: 'Invalid token',
          code: 'INVALID_TOKEN',
        });
      }
    });

    it('should throw RpcException with TOKEN_VALIDATION_FAILED code for other errors', async () => {
      const mockToken = 'problematic.token';
      mockRpcContext.getData.mockReturnValue({ token: mockToken });
      jwtService.verify.mockImplementation(() => {
        throw new Error('Some unexpected error');
      });

      await expect(guard.canActivate(mockContext)).rejects.toThrow(RpcException);
      await expect(guard.canActivate(mockContext)).rejects.toThrow('Token validation failed');
      try {
        await guard.canActivate(mockContext);
      } catch (error) {
        expect(error).toBeInstanceOf(RpcException);
        expect(error.getError()).toEqual({
          message: 'Token validation failed',
          code: 'TOKEN_VALIDATION_FAILED',
        });
      }
    });

    it('should throw RpcException for blacklisted token', async () => {
      const mockToken = 'blacklisted.token.here';
      mockRpcContext.getData.mockReturnValue({ token: mockToken });
      jwtService.verify.mockReturnValue({ userId: 'user123' });
      mockRedisClient.get.mockResolvedValue('true');

      await expect(guard.canActivate(mockContext)).rejects.toThrow(RpcException);
      expect(mockRedisClient.get).toHaveBeenCalledWith('blacklist:blacklisted.token.here');
    });
  });
});
