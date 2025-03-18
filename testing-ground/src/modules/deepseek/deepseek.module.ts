import { Module } from '@nestjs/common';
import { DeepseekController } from './controllers/deepseek.controller';
import { DeepseekService } from './services/deepseek.service';
import { HttpService } from '@nestjs/axios';

@Module({
  imports: [HttpService],
  controllers: [DeepseekController],
  providers: [DeepseekService],
})
export class DeepseekModule {}
