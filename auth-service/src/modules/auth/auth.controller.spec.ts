import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { RpcException } from '@nestjs/microservices';
import { User } from '../../models/user.model';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtService } from '@nestjs/jwt';
import { JwtAuthGuard } from '../../shared/guards/jwt-auth.guard';

// Mock JwtAuthGuard
jest.mock('../../shared/guards/jwt-auth.guard');

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: {
            register: jest.fn(),
            login: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn(),
          },
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: jest.fn().mockReturnValue(true) })
      .compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('register', () => {
    it('should call authService.register with correct parameters', async () => {
      const registerDto: RegisterDto = { email: 'test@example.com', password: 'password123' };
      const expectedResult: User = {
        email: registerDto.email,
        password: 'hashedPassword',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      jest.spyOn(authService, 'register').mockResolvedValue(expectedResult);

      const result = await controller.register(registerDto);

      expect(result).toEqual(expectedResult);
      expect(authService.register).toHaveBeenCalledWith(registerDto);
    });

    it('should throw RpcException when authService.register throws an error', async () => {
      const registerDto: RegisterDto = { email: 'test@example.com', password: 'password123' };
      const error = new Error('Registration failed');

      jest.spyOn(authService, 'register').mockRejectedValue(error);

      await expect(controller.register(registerDto)).rejects.toThrow(RpcException);
    });
  });

  describe('login', () => {
    it('should call authService.login with correct parameters', async () => {
      const loginDto: LoginDto = { email: 'test@example.com', password: 'password123' };
      const expectedResult = { accessToken: 'generatedAccessToken' };

      jest.spyOn(authService, 'login').mockResolvedValue(expectedResult);

      const result = await controller.login(loginDto);

      expect(result).toEqual(expectedResult);
      expect(authService.login).toHaveBeenCalledWith(loginDto);
    });

    it('should throw RpcException when authService.login throws an error', async () => {
      const loginDto: LoginDto = { email: 'test@example.com', password: 'password123' };
      const error = new Error('Login failed');

      jest.spyOn(authService, 'login').mockRejectedValue(error);

      await expect(controller.login(loginDto)).rejects.toThrow(RpcException);
    });
  });
});
