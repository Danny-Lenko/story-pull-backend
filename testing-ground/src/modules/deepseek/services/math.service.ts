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

  findMax(numbers: number[]): number {
    if (numbers.length === 0) {
      throw new BadRequestException('Array cannot be empty');
    }
    return Math.max(...numbers);
  }

  calculateAverage(numbers: number[]): number {
    if (numbers.length === 0) {
      throw new BadRequestException('Array cannot be empty');
    }
    const sum = numbers.reduce((acc, num) => acc + num, 0);
    return sum / numbers.length;
  }

  getStringLength(str: string): number {
    if (str.length === 0) {
      throw new BadRequestException('String cannot be empty');
    }
    return str.length;
  }
}
