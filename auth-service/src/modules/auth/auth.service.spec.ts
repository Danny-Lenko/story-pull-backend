import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { JwtService } from '@nestjs/jwt';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { User } from '../../models/user.model';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt');

describe('AuthService', () => {
  let service: AuthService;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let userModel: any;
  let jwtService: jest.Mocked<JwtService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: getModelToken(User.name),
          useValue: {
            findOne: jest.fn(),
            create: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    userModel = module.get(getModelToken(User.name));
    jwtService = module.get(JwtService) as jest.Mocked<JwtService>;
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('register', () => {
    it('should register a new user', async () => {
      const email = 'test@example.com';
      const password = 'password123';
      const hashedPassword = 'hashedPassword';

      userModel.findOne.mockResolvedValue(null);
      userModel.create.mockResolvedValue({ email, password: hashedPassword });
      (bcrypt.hash as jest.Mock).mockResolvedValue(hashedPassword);

      const result = await service.register({ email, password });

      expect(result).toEqual({ email, password: hashedPassword });
      expect(userModel.findOne).toHaveBeenCalledWith({ email });
      expect(bcrypt.hash).toHaveBeenCalledWith(password, 10);
      expect(userModel.create).toHaveBeenCalledWith({ email, password: hashedPassword });
    });

    it('should throw ConflictException if email already exists', async () => {
      const email = 'existing@example.com';
      const password = 'password123';

      userModel.findOne.mockResolvedValue({ email });

      await expect(service.register({ email, password })).rejects.toThrow(ConflictException);
    });
  });

  describe('login', () => {
    it('should return an access token for valid credentials', async () => {
      const email = 'test@example.com';
      const password = 'password123';
      const hashedPassword = 'hashedPassword';
      const user = { email, password: hashedPassword, _id: 'userId' };
      const accessToken = 'generatedAccessToken';

      userModel.findOne.mockResolvedValue(user);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      jwtService.sign.mockReturnValue(accessToken);

      const result = await service.login(email, password);

      expect(result).toEqual({ accessToken });
      expect(userModel.findOne).toHaveBeenCalledWith({ email });
      expect(bcrypt.compare).toHaveBeenCalledWith(password, hashedPassword);
      expect(jwtService.sign).toHaveBeenCalledWith({ email: user.email, sub: user._id });
    });

    it('should throw UnauthorizedException for invalid email', async () => {
      const email = 'nonexistent@example.com';
      const password = 'password123';

      userModel.findOne.mockResolvedValue(null);

      await expect(service.login(email, password)).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException for invalid password', async () => {
      const email = 'test@example.com';
      const password = 'wrongpassword';
      const hashedPassword = 'hashedPassword';
      const user = { email, password: hashedPassword };

      userModel.findOne.mockResolvedValue(user);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(service.login(email, password)).rejects.toThrow(UnauthorizedException);
    });
  });
});
