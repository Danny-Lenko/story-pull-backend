/* eslint-disable @typescript-eslint/no-explicit-any */
import { Test, TestingModule } from '@nestjs/testing';
import { AuthMiddleware } from './auth.middleware';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';

describe('middlewares', () => {
  let authMiddleware: AuthMiddleware;
  let jwtService: JwtService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthMiddleware,
        {
          provide: JwtService,
          useValue: {
            verify: jest.fn(),
          },
        },
      ],
    }).compile();

    authMiddleware = module.get<AuthMiddleware>(AuthMiddleware);
    jwtService = module.get<JwtService>(JwtService);
  });

  describe('AuthMiddleware', () => {
    let req: any;
    let res: any;
    let next: any;

    beforeEach(() => {
      req = {
        headers: {
          authorization: 'hello world',
        },
        user: { name: '', password: '' },
      };

      res = {};
      next = jest.fn();
    });

    it('should be defined', () => {
      expect(authMiddleware).toBeDefined();
    });

    it('should throw UnathorizedException "Token is missing" if token is falsy', () => {
      req = {
        headers: {
          authorization: null,
        },
        user: { name: '', password: '' },
      };

      expect(() => {
        authMiddleware.use(req, res, next);
      }).toThrow(UnauthorizedException);

      expect(() => {
        authMiddleware.use(req, res, next);
      }).toThrow('Token is missing');

      expect(next).not.toHaveBeenCalled();
    });

    it('should throw UnathorizedException "Invalid token" if token is not valid', () => {
      jest.spyOn(jwtService, 'verify').mockImplementation(() => {
        throw new UnauthorizedException('Invalid token');
      });

      expect(() => {
        authMiddleware.use(req, res, next);
      }).toThrow(UnauthorizedException);

      expect(() => {
        authMiddleware.use(req, res, next);
      }).toThrow('Invalid token');

      expect(next).not.toHaveBeenCalled();
    });

    it('should decorate req.user with the decoded value, if token is valid; next() should be called', () => {
      jest.spyOn(jwtService, 'verify').mockReturnValue({ name: 'John', password: 'Strong pass' });

      authMiddleware.use(req, res, next);

      expect(req.user).toEqual({ name: 'John', password: 'Strong pass' });

      expect(next).toHaveBeenCalled();
    });
  });
});
