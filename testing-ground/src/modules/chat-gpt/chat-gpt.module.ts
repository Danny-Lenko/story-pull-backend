import { Module } from '@nestjs/common';
import { ChatGptController } from './controllers/chat-gpt.controller';
import { ChatGptService } from './services/chat-gpt.service';
// import { JwtModule } from '@nestjs/jwt';

@Module({
  // imports: [JwtModule.register({ secret: 'hard!to-guess_secret' })],
  controllers: [ChatGptController],
  providers: [ChatGptService],
})
export class ChatGptModule {}
