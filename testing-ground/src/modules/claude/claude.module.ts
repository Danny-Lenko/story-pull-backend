import { Module } from '@nestjs/common';
import { ClaudeController } from './controllers/claude.controller';
import { ClaudeService } from './services/claude.service';
import { ProductService } from './services/product.service';
import { UserService } from './services/user.service';

@Module({
  controllers: [ClaudeController],
  providers: [ClaudeService, UserService, ProductService],
})
export class ClaudeModule {}
