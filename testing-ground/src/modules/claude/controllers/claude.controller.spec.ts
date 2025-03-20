import { Test, TestingModule } from '@nestjs/testing';
import { ClaudeController } from './claude.controller';

describe('ClaudeController', () => {
  let controller: ClaudeController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ClaudeController],
    }).compile();

    controller = module.get<ClaudeController>(ClaudeController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
