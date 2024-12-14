import { Test, TestingModule } from '@nestjs/testing';
import { ContentController } from './content.controller';
import { ContentService } from './content.service';
import { RpcException } from '@nestjs/microservices';
import { CreateContentDto } from './dto/create-content.dto';
import { Content } from '../../models/content.model';
import { of, throwError } from 'rxjs';
import { Logger, NotFoundException } from '@nestjs/common';

describe('ContentController', () => {
  let controller: ContentController;
  let contentService: ContentService;
  // let authClient: ClientProxy;
  let mockContentService: jest.Mocked<Partial<ContentService>>;
  let mockAuthClient: jest.Mocked<{ send: jest.Mock }>;

  beforeEach(async () => {
    mockContentService = {
      create: jest.fn(),
      findAllPaginated: jest.fn(),
      findById: jest.fn(),
    };

    mockAuthClient = {
      send: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ContentController],
      providers: [
        { provide: ContentService, useValue: mockContentService },
        { provide: 'AUTH_SERVICE', useValue: mockAuthClient },
      ],
    }).compile();

    controller = module.get<ContentController>(ContentController);
    contentService = module.get<ContentService>(ContentService);
    // authClient = module.get<ClientProxy>('AUTH_SERVICE');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    const createContentDto: CreateContentDto = {
      title: 'Test Content',
      body: 'This is a test content body',
      type: 'article',
      author: 'Test Author',
    };

    it('should create content successfully', (done) => {
      const expectedResult = {
        ...createContentDto,
        status: 'draft',
      };

      mockContentService.create.mockReturnValue(of(expectedResult));

      controller.create(createContentDto).subscribe({
        next: (result) => {
          expect(result).toEqual(expectedResult);
          expect(mockContentService.create).toHaveBeenCalledWith(createContentDto);
          done();
        },
        error: done.fail,
      });
    });

    it('should throw RpcException when content creation fails', (done) => {
      const error = new Error('Content creation failed');
      mockContentService.create.mockReturnValue(throwError(() => error));

      controller.create(createContentDto).subscribe({
        next: () => done.fail('Should have thrown an error'),
        error: (err) => {
          expect(err).toBeInstanceOf(RpcException);
          expect(mockContentService.create).toHaveBeenCalledWith(createContentDto);
          done();
        },
      });
    });

    it('should log the creation process', (done) => {
      const expectedResult: Content = {
        ...createContentDto,
        status: 'draft',
      };

      const logSpy = jest.spyOn(Logger.prototype, 'log');
      mockContentService.create.mockReturnValue(of(expectedResult));

      controller.create(createContentDto).subscribe({
        next: () => {
          expect(logSpy).toHaveBeenCalledWith(
            `Creating new content: ${JSON.stringify(createContentDto)}`,
          );
          done();
        },
        error: done.fail,
      });
    });
  });

  describe('findAll', () => {
    const queryContentDto = {
      page: 1,
      limit: 10,
    };

    it('should return paginated content', (done) => {
      const expectedResult = {
        data: [],
        total: 0,
        page: 1,
        limit: 10,
        meta: null,
      };

      mockContentService.findAllPaginated.mockReturnValue(of(expectedResult));

      controller.findAll(queryContentDto).subscribe({
        next: (result) => {
          expect(result).toEqual(expectedResult);
          expect(mockContentService.findAllPaginated).toHaveBeenCalledWith(queryContentDto);
          done();
        },
        error: done.fail,
      });
    });
  });

  describe('findById', () => {
    const mockContent = {
      id: '507f1f77bcf86cd799439011',
      title: 'Test Content',
      body: 'Test Body',
      type: 'article',
      author: 'Test Author',
      status: 'published',
    };

    it('should return content when valid ID is provided', (done) => {
      mockContentService.findById.mockReturnValue(of(mockContent));

      controller.findById({ id: mockContent.id }).subscribe({
        next: (content) => {
          expect(content).toEqual(mockContent);
          expect(contentService.findById).toHaveBeenCalledWith(mockContent.id);
          done();
        },
        error: done,
      });
    });

    it('should handle not found error', (done) => {
      mockContentService.findById.mockReturnValue(
        throwError(() => new NotFoundException(`Content with ID "invalid-id" not found`)),
      );

      controller.findById({ id: 'invalid-id' }).subscribe({
        error: (error) => {
          expect(error).toBeInstanceOf(RpcException);
          expect(error.message).toBe('Content with ID "invalid-id" not found');
          done();
        },
      });
    });
  });
});
