// src/services/math.service.ts
import { BadRequestException, Injectable } from '@nestjs/common';

@Injectable()
export class MathService {
  add(a: number, b: number): number {
    return a + b;
  }

  divide(a: number, b: number): number {
    if (b === 0) {
      throw new BadRequestException('Division by zero is not allowed');
    }
    return a / b;
  }
}
