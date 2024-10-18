import { Body, Controller, Logger, UseFilters, UseGuards } from '@nestjs/common';
import { MessagePattern, RpcException } from '@nestjs/microservices';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { RpcExceptionFilter } from '../../shared/filters/rpc-exception.filter';
import { ValidationPipe } from '../../shared/pipes/validation.pipe';
import { JwtAuthGuard } from '../../shared/guards/jwt-auth.guard';

@Controller()
@UseFilters(new RpcExceptionFilter())
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @MessagePattern({ cmd: 'register' })
  async register(@Body(new ValidationPipe()) registerDto: RegisterDto) {
    console.log('REGISTER DTO', registerDto);
    Logger.log('REGISTER DTO', registerDto);

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
    Logger.log('VALIDATE TOKEN DATA', data);

    try {
      // If we reach here, the token is valid (the guard would have thrown an exception otherwise)
      return { isValid: true };
    } catch (error) {
      Logger.error('Token validation failed', error.stack);
      if (error instanceof RpcException) {
        throw error; // Re-throw RpcExceptions as they are already formatted correctly
      }
      throw new RpcException({
        message: 'Token validation failed',
        code: 'TOKEN_VALIDATION_FAILED',
      });
    }
  }

  @UseGuards(JwtAuthGuard)
  @MessagePattern({ cmd: 'logout' })
  async logout(@Body() data: { token: string }) {
    try {
      return await this.authService.logout(data.token);
    } catch (error) {
      Logger.error('Logout failed', error.stack);
      throw new RpcException({
        message: 'Logout failed',
        code: 'LOGOUT_FAILED',
      });
    }
  }
}
