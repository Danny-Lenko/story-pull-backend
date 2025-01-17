import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { RpcException } from '@nestjs/microservices';
import { TokenExpiredError, JsonWebTokenError, NotBeforeError } from 'jsonwebtoken';
import { InjectRedis } from '@nestjs-modules/ioredis';
import Redis from 'ioredis';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    @InjectRedis() private readonly redis: Redis,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const rpcContext = context.switchToRpc();
    const data = rpcContext.getData();

    if (!data.token) {
      throw new RpcException({
        name: 'JsonWebTokenError',
        message: 'No token provided',
        status: 401,
      });
    }

    try {
      // Check if the token is blacklisted
      const isBlacklisted = await this.redis.get(`blacklist:${data.token}`);
      console.log('IS BLACKLISTED', isBlacklisted);
      if (isBlacklisted) {
        throw new RpcException({
          name: 'JsonWebTokenError',
          message: 'token blacklisted',
          status: 401,
        });
      }

      console.log('Token:', data.token);

      const payload = this.jwtService.verify(data.token);

      // Attach the payload to the request for use in handlers
      rpcContext.getContext().user = payload;
      return true;
    } catch (error) {
      console.error('Token validation error:', error);
      if (error instanceof RpcException) {
        throw error; // Re-throw RpcExceptions (including our blacklist exception)
      } else if (error instanceof TokenExpiredError) {
        // throw new RpcException({ message: 'Token has expired', code: 'TOKEN_EXPIRED' });
        throw new RpcException({ ...error, status: 401 });
      } else if (error instanceof JsonWebTokenError) {
        // throw new RpcException({ message: 'Invalid token', code: 'INVALID_TOKEN' });
        throw new RpcException({ ...error, status: 401 });
      } else if (error instanceof NotBeforeError) {
        // throw new RpcException({ message: 'Token not yet active', code: 'TOKEN_NOT_ACTIVE' });
        throw new RpcException({ ...error, status: 401 });
      } else {
        // throw new RpcException({
        //   message: 'Token validation failed',
        //   code: 'TOKEN_VALIDATION_FAILED',
        // });
        throw new RpcException({ ...error, message: 'token validation failed', status: 401 });
      }
    }
  }
}

// ============================ DOCUMENTATION PIECE:

// Here's an example of how another service might validate a token:

// import { Injectable } from '@nestjs/common';
// import { ClientProxy, ClientProxyFactory, Transport } from '@nestjs/microservices';
// import { firstValueFrom } from 'rxjs';

// @Injectable()
// export class AuthClient {
//   private client: ClientProxy;

//   constructor() {
//     this.client = ClientProxyFactory.create({
//       transport: Transport.TCP,
//       options: { host: 'localhost', port: 4001 },
//     });
//   }

//   async validateToken(token: string): Promise<boolean> {
//     try {
//       const result = await firstValueFrom(this.client.send({ cmd: 'validateToken' }, { token }));
//       return result.isValid;
//     } catch (error) {
//       return false;
//     }
//   }
// }
