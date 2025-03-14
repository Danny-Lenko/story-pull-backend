import { Module } from '@nestjs/common';
import { ChatGptController } from './controllers/chat-gpt.controller';
import { ChatGptService } from './services/chat-gpt.service';

@Module({
  controllers: [ChatGptController],
  providers: [ChatGptService],
})
export class ChatGptModule {}
