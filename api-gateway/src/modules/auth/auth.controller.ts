import { Controller, Get, Req, UseGuards } from '@nestjs/common';
// import { ClientProxy } from '@nestjs/microservices';
// import { Observable } from 'rxjs';
// import { handleRpcError } from '../../utils/operators/rpc-error-handler.operator';
import { JwtAuthGuard } from 'src/shared/guards/jwt.auth.guard';

@Controller('api/auth')
export class AuthController {
  // constructor(@Inject('AUTH_SERVICE') private readonly authClient: ClientProxy) {}

  // @Post('register')
  // register(@Body() registerDto: unknown): Observable<unknown> {
  //   return this.authClient.send({ cmd: 'register' }, registerDto).pipe(handleRpcError());
  // }

  // @Post('login')
  // login(@Body() loginDto: unknown): Observable<unknown> {
  //   return this.authClient.send({ cmd: 'login' }, loginDto).pipe(handleRpcError());
  // }

  // @Post('validate-token')
  // validateToken(@Body() data: { token: string }): Observable<unknown> {
  //   return this.authClient.send({ cmd: 'validateToken' }, data).pipe(handleRpcError());
  // }

  // @Post('logout')
  // logout(@Body() data: { token: string }): Observable<unknown> {
  //   return this.authClient.send({ cmd: 'logout' }, data).pipe(handleRpcError());
  // }

  @Get('/protected')
  @UseGuards(JwtAuthGuard)
  async protected(@Req() req) {
    return {
      message: 'AuthGuard works 🎉',
      authenticated_user: req.user,
    };
  }
}
