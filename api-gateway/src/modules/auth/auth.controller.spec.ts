import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { ClientProxy } from '@nestjs/microservices';
import { of, throwError } from 'rxjs';
import { HttpException, HttpStatus } from '@nestjs/common';

jest.mock('@nestjs/microservices');

describe('AuthController', () => {
  let controller: AuthController;
  let authClientMock: jest.Mocked<ClientProxy>;

  beforeEach(async () => {
    authClientMock = {
      send: jest.fn(),
      emit: jest.fn(),
      connect: jest.fn(),
      close: jest.fn(),
    } as unknown as jest.Mocked<ClientProxy>;

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: 'AUTH_SERVICE',
          useValue: authClientMock,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('register', () => {
    it('should call authClient.send with correct parameters', (done) => {
      const registerDto = { username: 'testuser', password: 'password123' };
      const expectedResponse = { id: 1, username: 'testuser' };

      authClientMock.send.mockReturnValue(of(expectedResponse));

      controller.register(registerDto).subscribe({
        next: (result) => {
          expect(result).toEqual(expectedResponse);
          expect(authClientMock.send).toHaveBeenCalledWith({ cmd: 'register' }, registerDto);
          done();
        },
        error: done,
      });
    });

    it('should handle RPC errors', (done) => {
      const registerDto = { username: 'testuser', password: 'password123' };
      const rpcError = {
        isRpcException: true,
        error: { message: 'User already exists', status: HttpStatus.CONFLICT },
      };

      authClientMock.send.mockReturnValue(throwError(() => rpcError));

      controller.register(registerDto).subscribe({
        error: (error) => {
          expect(error).toBeInstanceOf(HttpException);
          expect(error.getStatus()).toBe(HttpStatus.CONFLICT);
          expect(error.getResponse()).toEqual(rpcError.error);
          done();
        },
      });
    });
  });

  describe('login', () => {
    it('should call authClient.send with correct parameters', (done) => {
      const loginDto = { username: 'testuser', password: 'password123' };
      const expectedResponse = { token: 'jwt_token_here' };

      authClientMock.send.mockReturnValue(of(expectedResponse));

      controller.login(loginDto).subscribe({
        next: (result) => {
          expect(result).toEqual(expectedResponse);
          expect(authClientMock.send).toHaveBeenCalledWith({ cmd: 'login' }, loginDto);
          done();
        },
        error: done,
      });
    });
  });

  describe('validateToken', () => {
    it('should call authClient.send with correct parameters', (done) => {
      const tokenData = { token: 'valid_token_here' };
      const expectedResponse = { valid: true, userId: 1 };

      authClientMock.send.mockReturnValue(of(expectedResponse));

      controller.validateToken(tokenData).subscribe({
        next: (result) => {
          expect(result).toEqual(expectedResponse);
          expect(authClientMock.send).toHaveBeenCalledWith({ cmd: 'validateToken' }, tokenData);
          done();
        },
        error: done,
      });
    });
  });

  describe('logout', () => {
    it('should call authClient.send with correct parameters', (done) => {
      const logoutData = { token: 'token_to_invalidate' };
      const expectedResponse = { success: true };

      authClientMock.send.mockReturnValue(of(expectedResponse));

      controller.logout(logoutData).subscribe({
        next: (result) => {
          expect(result).toEqual(expectedResponse);
          expect(authClientMock.send).toHaveBeenCalledWith({ cmd: 'logout' }, logoutData);
          done();
        },
        error: done,
      });
    });
  });
});
