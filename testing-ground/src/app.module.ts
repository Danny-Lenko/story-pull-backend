import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ChatGptService } from './modules/chat-gpt/services/chat-gpt.service';
import { ChatGptController } from './modules/chat-gpt/controllers/chat-gpt.controller';
import { ChatGptModule } from './modules/chat-gpt/chat-gpt.module';

@Module({
  imports: [ChatGptModule],
  controllers: [AppController, ChatGptController],
  providers: [AppService, ChatGptService],
})
export class AppModule {}
