import { Test, TestingModule } from '@nestjs/testing';
import { ContentController } from './content.controller';
import { ContentService } from './content.service';
import {
  // ClientProxy,
  RpcException,
} from '@nestjs/microservices';
import { CreateContentDto } from './dto/create-content.dto';
import { Content } from '../../models/content.model';

describe('ContentController', () => {
  let controller: ContentController;
  //   let contentService: ContentService;
  //   let authClient: ClientProxy;

  const mockContentService = {
    create: jest.fn(),
  };

  const mockAuthClient = {
    send: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ContentController],
      providers: [
        { provide: ContentService, useValue: mockContentService },
        { provide: 'AUTH_SERVICE', useValue: mockAuthClient },
      ],
    }).compile();

    controller = module.get<ContentController>(ContentController);
    //  contentService = module.get<ContentService>(ContentService);
    //  authClient = module.get<ClientProxy>('AUTH_SERVICE');
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create content successfully', async () => {
      const createContentDto: CreateContentDto = {
        title: 'Test Content',
        body: 'This is a test content body',
        type: 'article',
        author: 'Test Author',
      };

      const expectedResult: Partial<Content> = {
        ...createContentDto,
        status: 'draft',
        //   _id: 'someId',
      };

      mockContentService.create.mockResolvedValue(expectedResult);

      const result = await controller.create({ data: createContentDto });

      expect(result).toEqual(expectedResult);
      expect(mockContentService.create).toHaveBeenCalledWith(createContentDto);
    });

    it('should throw RpcException when content creation fails', async () => {
      const createContentDto: CreateContentDto = {
        title: 'Test Content',
        body: 'This is a test content body',
        type: 'article',
        author: 'Test Author',
      };

      const error = new Error('Content creation failed');
      mockContentService.create.mockRejectedValue(error);

      await expect(controller.create({ data: createContentDto })).rejects.toThrow(RpcException);
      expect(mockContentService.create).toHaveBeenCalledWith(createContentDto);
    });

    it('should log the creation process', async () => {
      const createContentDto: CreateContentDto = {
        title: 'Test Content',
        body: 'This is a test content body',
        type: 'article',
        author: 'Test Author',
      };

      const logSpy = jest.spyOn(controller['logger'], 'log');
      mockContentService.create.mockResolvedValue({ ...createContentDto, _id: 'someId' });

      await controller.create({ data: createContentDto });

      expect(logSpy).toHaveBeenCalledWith(
        `Creating new content: ${JSON.stringify(createContentDto)}`,
      );
      expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('Content created successfully'));
    });

    it('should log errors during content creation', async () => {
      const createContentDto: CreateContentDto = {
        title: 'Test Content',
        body: 'This is a test content body',
        type: 'article',
        author: 'Test Author',
      };

      const error = new Error('Content creation failed');
      mockContentService.create.mockRejectedValue(error);

      const errorSpy = jest.spyOn(controller['logger'], 'error');

      await expect(controller.create({ data: createContentDto })).rejects.toThrow(RpcException);

      expect(errorSpy).toHaveBeenCalledWith(
        `Error creating content: ${error.message}`,
        error.stack,
      );
    });
  });
});
