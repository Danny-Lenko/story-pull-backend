import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { AuthService } from './auth.service';

@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @MessagePattern({ cmd: 'register' })
  async register(@Payload() data: { email: string; password: string }) {
    return this.authService.register(data.email, data.password);
  }

  @MessagePattern({ cmd: 'login' })
  async login(@Payload() data: { email: string; password: string }) {
    return this.authService.login(data.email, data.password);
  }
}
