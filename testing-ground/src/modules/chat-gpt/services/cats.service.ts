import { Injectable } from '@nestjs/common';
import { DatabaseService } from './database.service';

@Injectable()
export class CatsService {
  constructor(private readonly databaseService: DatabaseService) {}

  findAll() {
    return this.databaseService.findAll();
  }

  findOne(id: number) {
    return this.databaseService.findOne(id);
  }

  create(name: string) {
    return this.databaseService.create(name);
  }

  delete(id: number) {
    return this.databaseService.delete(id);
  }
}
