import { Module } from '@nestjs/common';
import { ClaudeController } from './controllers/claude.controller';
import { ClaudeService } from './services/claude.service';

@Module({
  controllers: [ClaudeController],
  providers: [ClaudeService],
})
export class ClaudeModule {}
