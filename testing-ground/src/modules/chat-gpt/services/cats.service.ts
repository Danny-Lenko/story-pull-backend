import { Injectable } from '@nestjs/common';

@Injectable()
export class CatsService {
  private cats = ['Tom', 'Whiskers', 'Garfield'];

  findAll(): string[] {
    return this.cats;
  }
}
