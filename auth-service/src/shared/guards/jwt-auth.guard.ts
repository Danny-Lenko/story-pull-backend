import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { RpcException } from '@nestjs/microservices';
import { Observable } from 'rxjs';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    const rpcContext = context.switchToRpc();
    const data = rpcContext.getData();

    if (!data.token) {
      throw new RpcException('No token provided');
    }

    try {
      const payload = this.jwtService.verify(data.token);
      // Optionally, you can attach the payload to the request for use in your handlers
      rpcContext.getContext().user = payload;
      return true;
    } catch (error) {
      throw new RpcException({ ...error, message: 'Invalid token' });
    }
  }
}

// DOCUMENTATION PIECE:

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
