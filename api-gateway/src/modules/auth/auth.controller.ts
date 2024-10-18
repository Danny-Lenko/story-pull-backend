import { Body, Controller, Inject, Post } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { Observable } from 'rxjs';

@Controller('api/auth')
export class AuthController {
  constructor(@Inject('AUTH_SERVICE') private readonly authClient: ClientProxy) {}

  @Post('register')
  register(@Body() registerDto: unknown): Observable<unknown> {
    return this.authClient.send({ cmd: 'register' }, registerDto);
  }

  @Post('login')
  login(@Body() loginDto: unknown): Observable<unknown> {
    return this.authClient.send({ cmd: 'login' }, loginDto);
  }

  @Post('validate-token')
  validateToken(@Body() data: { token: string }): Observable<unknown> {
    return this.authClient.send({ cmd: 'validateToken' }, data);
  }

  @Post('logout')
  logout(@Body() data: { token: string }): Observable<unknown> {
    return this.authClient.send({ cmd: 'logout' }, data);
  }
}
