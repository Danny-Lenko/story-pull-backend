import { Injectable, NotFoundException } from '@nestjs/common';

@Injectable()
export class DatabaseService {
  private cats = ['Tom', 'Whiskers', 'Garfield'];

  findAll(): string[] {
    return this.cats;
  }

  findOne(id: number): string {
    const cat = this.cats[id];
    if (!cat) {
      throw new NotFoundException('Cat not found');
    }
    return cat;
  }

  create(name: string): string {
    this.cats.push(name);
    return name;
  }

  delete(id: number): void {
    if (!this.cats[id]) {
      throw new NotFoundException('Cat not found');
    }
    this.cats.splice(id, 1);
  }
}
