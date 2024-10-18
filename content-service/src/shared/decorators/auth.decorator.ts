import { applyDecorators, UseGuards } from '@nestjs/common';
import { MicroserviceAuthGuard } from '../guards/auth.guard';

export function Auth() {
  return applyDecorators(UseGuards(MicroserviceAuthGuard));
}
