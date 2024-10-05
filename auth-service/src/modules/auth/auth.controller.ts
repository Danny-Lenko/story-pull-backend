import { Body, Controller, UseFilters } from '@nestjs/common';
import { MessagePattern, RpcException } from '@nestjs/microservices';
import { AuthService } from './auth.service';
import { RpcExceptionFilter } from '../../shared/filters/rpc-exception.filter';
import { RegisterDto } from './register.dto';
import { ValidationPipe } from '../../shared/pipes/validation.pipe';
import { LoginDto } from './login.dto';

@Controller()
@UseFilters(new RpcExceptionFilter())
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @MessagePattern({ cmd: 'register' })
  async register(@Body(new ValidationPipe()) registerDto: RegisterDto) {
    try {
      return await this.authService.register(registerDto);
    } catch (error) {
      throw new RpcException(error);
    }
  }

  @MessagePattern({ cmd: 'login' })
  async login(@Body(new ValidationPipe()) loginDto: LoginDto) {
    try {
      return await this.authService.login(loginDto);
    } catch (error) {
      throw new RpcException(error);
    }
  }
}
