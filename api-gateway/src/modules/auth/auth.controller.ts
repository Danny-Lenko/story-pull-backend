import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/shared/guards/jwt.auth.guard';

@Controller('api/auth')
export class AuthController {
  @Get('/protected')
  @UseGuards(JwtAuthGuard)
  async protected(@Req() req) {
    return {
      message: 'AuthGuard works 🎉',
      authenticated_user: req.user,
    };
  }
}
