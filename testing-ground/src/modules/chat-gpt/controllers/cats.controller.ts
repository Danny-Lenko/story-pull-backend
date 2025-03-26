import { Controller, Get, Post, Param, Delete, Body, NotFoundException } from '@nestjs/common';
import { CatsService } from '../services/cats.service';

@Controller('cats')
export class CatsController {
  constructor(private readonly catsService: CatsService) {}

  @Get()
  findAll() {
    return this.catsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    const cat = this.catsService.findOne(Number(id));
    if (!cat) {
      throw new NotFoundException('Cat not found');
    }
    return cat;
  }

  @Post()
  create(@Body() name: string) {
    return this.catsService.create(name);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.catsService.delete(Number(id));
  }
}
