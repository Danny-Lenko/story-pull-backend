import { Injectable, CanActivate, ExecutionContext, Inject } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import { ClientProxy, RpcException } from '@nestjs/microservices';

@Injectable()
export class MicroserviceAuthGuard implements CanActivate {
  constructor(@Inject('AUTH_SERVICE') private client: ClientProxy) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const message = context.switchToRpc().getData();

    let token: string | undefined;

    if (message && typeof message === 'object' && 'metadata' in message) {
      token = message.metadata?.authorization;
    }

    if (!token) {
      console.log('No token found in message metadata');
      return false;
    }

    token = token.replace('Bearer ', '');

    try {
      const isValid = await firstValueFrom(this.client.send({ cmd: 'validateToken' }, { token }));
      console.log('Token validation result:', isValid);
      return isValid;
    } catch (error) {
      console.error('Token validation failed:', error);
      throw new RpcException(error);
    }
  }
}
