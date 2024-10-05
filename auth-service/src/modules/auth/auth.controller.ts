import { Body, Controller, Logger, UseFilters, UseGuards } from '@nestjs/common';
import { MessagePattern, RpcException } from '@nestjs/microservices';
import { AuthService } from './auth.service';
import { RegisterDto } from './register.dto';
import { LoginDto } from './login.dto';
import { RpcExceptionFilter } from '../../shared/filters/rpc-exception.filter';
import { ValidationPipe } from '../../shared/pipes/validation.pipe';
import { JwtAuthGuard } from '../../shared/guards/jwt-auth.guard';

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

  @UseGuards(JwtAuthGuard)
  @MessagePattern({ cmd: 'validateToken' })
  async validateToken(data: { token: string }) {
    Logger.log('DATA', data);
    // If we reach here, the token is valid (the guard would have thrown an exception otherwise)
    return { isValid: true };
  }
}
