import { Injectable, CanActivate, ExecutionContext, Inject } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import { ClientProxy } from '@nestjs/microservices';

@Injectable()
export class MicroserviceAuthGuard implements CanActivate {
  constructor(@Inject('AUTH_SERVICE') private client: ClientProxy) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const ctx = context.switchToRpc().getContext();
    const metadata = ctx.get('metadata');
    const token = metadata['authorization'];

    if (!token) {
      return false;
    }

    try {
      const isValid = await firstValueFrom(this.client.send({ cmd: 'validateToken' }, { token }));
      return isValid;
    } catch {
      return false;
    }
  }
}
