import { Injectable, CanActivate, ExecutionContext, Inject } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import { ClientProxy } from '@nestjs/microservices';

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
      throw error;
      return false;
    }
  }
}

// import { Injectable, CanActivate, ExecutionContext, Inject } from '@nestjs/common';
// import { firstValueFrom } from 'rxjs';
// import { ClientProxy } from '@nestjs/microservices';

// @Injectable()
// export class MicroserviceAuthGuard implements CanActivate {
//   constructor(@Inject('AUTH_SERVICE') private client: ClientProxy) {}

//   async canActivate(context: ExecutionContext): Promise<boolean> {
//     const ctx = context.switchToRpc().getContext();
//     console.log('ctx', ctx);

//     let token: string | undefined;

//     if (ctx && typeof ctx === 'object' && 'socket' in ctx) {
//       const socket = ctx.socket;
//       if (socket && socket.handshake && socket.handshake.headers) {
//         token = socket.handshake.headers.authorization;
//       }
//     }

//     // If token is not found in socket headers, try to parse it from the message
//     if (!token) {
//       const message = context.switchToRpc().getData();
//       if (typeof message === 'object' && message !== null) {
//         token = message.metadata?.authorization;
//       }
//     }

//     if (!token) {
//       console.log('No token found');
//       return false;
//     }

//     try {
//       const isValid = await firstValueFrom(this.client.send({ cmd: 'validateToken' }, { token }));
//       return isValid;
//     } catch (error) {
//       console.error('Token validation failed:', error);
//       return false;
//     }
//   }
// }

// =================================================================================================================

// import { Injectable, CanActivate, ExecutionContext, Inject } from '@nestjs/common';
// import { firstValueFrom } from 'rxjs';
// import { ClientProxy } from '@nestjs/microservices';

// @Injectable()
// export class MicroserviceAuthGuard implements CanActivate {
//   constructor(@Inject('AUTH_SERVICE') private client: ClientProxy) {}

//   async canActivate(context: ExecutionContext): Promise<boolean> {
//     const ctx = context.switchToRpc().getContext().args;

//     console.log('ctx', ctx.args);

//     // Check if ctx is an array and has at least two elements
//     if (Array.isArray(ctx) && ctx.length >= 2) {
//       const [socket, data] = ctx;

//       // Parse the data string to get the JSON object
//       let parsedData;
//       try {
//         parsedData = JSON.parse(data);

//         console.log('parsedData', parsedData);
//         console.log("SOCKET", socket);
//       } catch (error) {
//         console.error('Failed to parse data:', error);
//         return false;
//       }

//       // Extract token from parsedData or socket
//       let token;
//       if (parsedData && parsedData.metadata && parsedData.metadata.authorization) {
//         token = parsedData.metadata.authorization;
//       } else if (
//         socket &&
//         socket.handshake &&
//         socket.handshake.headers &&
//         socket.handshake.headers.authorization
//       ) {
//         token = socket.handshake.headers.authorization;
//       }

//       if (!token) {
//         return false;
//       }

//       try {
//         const isValid = await firstValueFrom(this.client.send({ cmd: 'validateToken' }, { token }));
//         return isValid;
//       } catch {
//         return false;
//       }
//     }

//     return false;
//   }
// }

// =================================================================================================================

// import { Injectable, CanActivate, ExecutionContext, Inject } from '@nestjs/common';
// import { firstValueFrom } from 'rxjs';
// import { ClientProxy } from '@nestjs/microservices';

// @Injectable()
// export class MicroserviceAuthGuard implements CanActivate {
//   constructor(@Inject('AUTH_SERVICE') private client: ClientProxy) {}

//   async canActivate(context: ExecutionContext): Promise<boolean> {
//     const ctx = context.switchToRpc().getContext();

//     console.log('ctx', ctx);

//     const metadata = ctx.get('metadata');
//     const token = metadata['authorization'];

//     if (!token) {
//       return false;
//     }

//     try {
//       const isValid = await firstValueFrom(this.client.send({ cmd: 'validateToken' }, { token }));
//       return isValid;
//     } catch {
//       return false;
//     }
//   }
// }
