import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ChatGptService } from './modules/chat-gpt/services/chat-gpt.service';
import { ChatGptController } from './modules/chat-gpt/controllers/chat-gpt.controller';
import { ChatGptModule } from './modules/chat-gpt/chat-gpt.module';
import { DeepseekModule } from './modules/deepseek/deepseek.module';
import { ClaudeModule } from './modules/claude/claude.module';
import { DeepseekModule } from './modules/deepseek/deepseek.module';

@Module({
  imports: [ChatGptModule, DeepseekModule, ClaudeModule],
  controllers: [AppController, ChatGptController],
  providers: [AppService, ChatGptService],
})
export class AppModule {}
