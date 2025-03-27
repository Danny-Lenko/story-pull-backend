import { ExecutionContext, ForbiddenException, UnauthorizedException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Reflector } from '@nestjs/core';
import { AuthGuard, RolesGuard, WsAuthGuard } from './auth.guard';
import { JwtService } from '@nestjs/jwt';

describe('AuthGuard', () => {
  let guard: AuthGuard;
  let rolesGuard: RolesGuard;
  let reflector: Reflector;
  let jwtService: JwtService;
  let wsAuthGuard: WsAuthGuard;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthGuard,
        RolesGuard,
        JwtService,
        WsAuthGuard,
        {
          provide: Reflector,
          useValue: {
            getAllAndOverride: jest.fn(),
            get: jest.fn(),
          },
        },
      ],
    }).compile();

    guard = module.get<AuthGuard>(AuthGuard);
    rolesGuard = module.get<RolesGuard>(RolesGuard);
    reflector = module.get<Reflector>(Reflector);
    jwtService = module.get<JwtService>(JwtService);
    wsAuthGuard = module.get<WsAuthGuard>(WsAuthGuard);
  });

  const createMockExecutionContext = (isAuthenticated = true, user = null): ExecutionContext => {
    return {
      switchToHttp: () => ({
        getRequest: () => ({
          headers: {
            authorization: isAuthenticated,
          },
          user: user,
        }),
      }),
      getHandler: () => ({}),
      getClass: () => ({}),
      switchToWs: () => ({
        getClient: () => ({
          user: user,
          handshake: {
            auth: {
              token: isAuthenticated,
            },
          },
        }),
      }),
    } as ExecutionContext;
  };

  describe('guard', () => {
    it('should return true if there is authorization in headers', async () => {
      const context = createMockExecutionContext(true, { id: 1, name: 'John' });

      expect(guard.canActivate(context)).toBe(true);
    });

    it('should throw UnauthorizedException if there is no authorization header', async () => {
      const context = createMockExecutionContext(null, { id: 1, name: 'John' });

      expect(() => {
        guard.canActivate(context);
      }).toThrow(UnauthorizedException);
    });
  });

  describe('RolesGuard', () => {
    it('should return true if roles fit', () => {
      const context = createMockExecutionContext(true, { id: 1, name: 'John', roles: ['editor'] });

      jest.spyOn(reflector, 'get').mockReturnValue(['admin', 'editor']);

      expect(rolesGuard.canActivate(context)).toBe(true);
    });

    it('should return true if no roles required', () => {
      const context = createMockExecutionContext(true, { id: 1, name: 'John', roles: ['editor'] });

      jest.spyOn(reflector, 'get').mockReturnValue(undefined);

      expect(rolesGuard.canActivate(context)).toBe(true);
    });

    it('should return true if roles fit', () => {
      const context = createMockExecutionContext(true, { id: 1, name: 'John', roles: ['editor'] });

      jest.spyOn(reflector, 'get').mockReturnValue(['admin', 'editor']);

      expect(rolesGuard.canActivate(context)).toBe(true);
    });

    it.each([
      [null, new UnauthorizedException('User not found')],
      [
        { id: 1, name: 'John', roles: ['author'] },
        new ForbiddenException('Insufficient permissions'),
      ],
    ])('should throw a proper exception on the related condition', (author, errorMessage) => {
      const context = createMockExecutionContext(true, author);

      jest.spyOn(reflector, 'get').mockReturnValue(['admin', 'editor']);

      expect(() => {
        rolesGuard.canActivate(context);
      }).toThrow(errorMessage);
    });
  });

  describe('WsAuthGuard', () => {
    it('should pass if the token is valid', () => {
      const context = createMockExecutionContext(true, { id: 1, name: 'John', roles: ['editor'] });

      jest.spyOn(jwtService, 'verify').mockReturnValue({ id: 1, name: 'John', roles: ['editor'] });

      expect(wsAuthGuard.canActivate(context)).toBe(true);
    });

    it('should throw No token provided if token is a falsy value', () => {
      const context = createMockExecutionContext(false, { id: 1, name: 'John', roles: ['editor'] });

      expect(() => {
        wsAuthGuard.canActivate(context);
      }).toThrow('No token provided');
    });

    it('should throw Invalid token if the verification failes', () => {
      const context = createMockExecutionContext(true, { id: 1, name: 'John', roles: ['editor'] });

      jest.spyOn(jwtService, 'verify').mockImplementationOnce(() => {
        throw new UnauthorizedException('Invalid token');
      });

      expect(() => {
        wsAuthGuard.canActivate(context);
      }).toThrow('Invalid token');
    });
  });
});
