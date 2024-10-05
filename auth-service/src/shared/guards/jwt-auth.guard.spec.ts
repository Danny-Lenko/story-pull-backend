import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionContext } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { RpcException } from '@nestjs/microservices';
import { JwtAuthGuard } from './jwt-auth.guard';
import { TokenExpiredError, JsonWebTokenError } from 'jsonwebtoken';

describe('JwtAuthGuard', () => {
  let guard: JwtAuthGuard;
  let jwtService: jest.Mocked<JwtService>;

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
      ],
    }).compile();

    guard = module.get<JwtAuthGuard>(JwtAuthGuard);
    jwtService = module.get(JwtService) as jest.Mocked<JwtService>;
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

    it('should throw RpcException if no token is provided', () => {
      mockRpcContext.getData.mockReturnValue({});

      expect(() => guard.canActivate(mockContext)).toThrow(RpcException);
      expect(() => guard.canActivate(mockContext)).toThrow('No token provided');
    });

    it('should return true for a valid token', () => {
      const mockToken = 'valid.token.here';
      const mockPayload = { sub: '123', email: 'test@example.com' };
      mockRpcContext.getData.mockReturnValue({ token: mockToken });
      jwtService.verify.mockReturnValue(mockPayload);

      const result = guard.canActivate(mockContext);

      expect(result).toBe(true);
      expect(jwtService.verify).toHaveBeenCalledWith(mockToken);
      expect(mockRpcContext.getContext().user).toEqual(mockPayload);
    });

    it('should throw RpcException with TOKEN_EXPIRED code for expired token', () => {
      const mockToken = 'expired.token.here';
      mockRpcContext.getData.mockReturnValue({ token: mockToken });
      jwtService.verify.mockImplementation(() => {
        throw new TokenExpiredError('jwt expired', new Date());
      });

      expect(() => guard.canActivate(mockContext)).toThrow(RpcException);
      try {
        guard.canActivate(mockContext);
      } catch (error) {
        expect(error).toBeInstanceOf(RpcException);
        expect(error.getError()).toEqual({
          message: 'Token has expired',
          code: 'TOKEN_EXPIRED',
        });
      }
    });

    it('should throw RpcException with INVALID_TOKEN code for invalid token', () => {
      const mockToken = 'invalid.token.here';
      mockRpcContext.getData.mockReturnValue({ token: mockToken });
      jwtService.verify.mockImplementation(() => {
        throw new JsonWebTokenError('invalid token');
      });

      expect(() => guard.canActivate(mockContext)).toThrow(RpcException);
      try {
        guard.canActivate(mockContext);
      } catch (error) {
        expect(error).toBeInstanceOf(RpcException);
        expect(error.getError()).toEqual({
          message: 'Invalid token',
          code: 'INVALID_TOKEN',
        });
      }
    });

    it('should throw RpcException with TOKEN_VALIDATION_FAILED code for other errors', () => {
      const mockToken = 'problematic.token';
      mockRpcContext.getData.mockReturnValue({ token: mockToken });
      jwtService.verify.mockImplementation(() => {
        throw new Error('Some unexpected error');
      });

      expect(() => guard.canActivate(mockContext)).toThrow(RpcException);
      try {
        guard.canActivate(mockContext);
      } catch (error) {
        expect(error).toBeInstanceOf(RpcException);
        expect(error.getError()).toEqual({
          message: 'Token validation failed',
          code: 'TOKEN_VALIDATION_FAILED',
        });
      }
    });
  });
});
