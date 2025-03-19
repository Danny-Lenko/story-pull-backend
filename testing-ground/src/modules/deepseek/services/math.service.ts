import { HttpService } from '@nestjs/axios';
import { BadRequestException, Injectable } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class MathService {
  private cache: Map<string, number> = new Map();

  constructor(private readonly httpService: HttpService) {}

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

  sumObjectValues(obj: { a: number; b: number }): number {
    if (!obj || typeof obj !== 'object' || !('a' in obj) || !('b' in obj)) {
      throw new BadRequestException('Object must contain properties "a" and "b"');
    }
    return obj.a + obj.b;
  }

  async asyncSum(a: number, b: number): Promise<number> {
    if (a < 0 || b < 0) {
      throw new BadRequestException('Numbers cannot be negative');
    }

    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(a + b);
      }, 100);
    });
  }

  async fetchAndDouble(number: number): Promise<number> {
    try {
      const response = await firstValueFrom(
        this.httpService.get(`https://api.example.com/number/${number}`),
      );
      return response.data.value * 2;
    } catch (error) {
      console.log('ERROR:', error);
      throw new BadRequestException('Failed to fetch number');
    }
  }

  getCachedSquare(number: number): number {
    const cacheKey = `square:${number}`;
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }
    const result = number * number;
    this.cache.set(cacheKey, result);
    return result;
  }

  getDaysUntilEndOfYear(date: Date): number {
    const endOfYear = new Date(date.getFullYear(), 11, 31);
    const timeDiff = endOfYear.getTime() - date.getTime();

    if (timeDiff < 0) {
      throw new BadRequestException('Date is already after the end of the year');
    }

    return Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
  }

  doubleArray(numbers: number[]): number[] {
    if (numbers.length === 0) {
      throw new BadRequestException('Array cannot be empty');
    }
    return numbers.map((num) => num * 2);
  }

  calculateDistance(point: { x: number; y: number }): number {
    if (!point || typeof point !== 'object' || !('x' in point) || !('y' in point)) {
      throw new BadRequestException('Point must contain properties "x" and "y"');
    }
    return Math.sqrt(point.x ** 2 + point.y ** 2);
  }

  reverseString(str: string): string {
    if (str.length === 0) {
      throw new BadRequestException('String cannot be empty');
    }
    return str.split('').reverse().join('');
  }

  sumArrayObjectValues(objects: { value: number }[]): number {
    if (objects.length === 0) {
      throw new BadRequestException('Array cannot be empty');
    }

    let sum = 0;
    for (const obj of objects) {
      if (typeof obj.value !== 'number') {
        throw new BadRequestException('Each object must contain a "value" property');
      }
      sum += obj.value;
    }

    return sum;
  }
}
