import { Module } from '@nestjs/common';
import { DeepseekController } from './controllers/deepseek.controller';
import { DeepseekService } from './services/deepseek.service';

@Module({
  controllers: [DeepseekController],
  providers: [DeepseekService],
})
export class DeepseekModule {}
