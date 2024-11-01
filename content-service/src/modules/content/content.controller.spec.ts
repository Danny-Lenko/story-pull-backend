import { Test, TestingModule } from '@nestjs/testing';
import { ContentController } from './content.controller';
import { ContentService } from './content.service';
import { RpcException } from '@nestjs/microservices';
import { CreateContentDto } from './dto/create-content.dto';
import { Content } from '../../models/content.model';
import { of, throwError } from 'rxjs';
import { Logger } from '@nestjs/common';

describe('ContentController', () => {
  let controller: ContentController;
  let mockContentService: jest.Mocked<Partial<ContentService>>;
  let mockAuthClient: jest.Mocked<{ send: jest.Mock }>;

  beforeEach(async () => {
    mockContentService = {
      create: jest.fn(),
      findAllPaginated: jest.fn(),
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
});

// import { Test, TestingModule } from '@nestjs/testing';
// import { ContentController } from './content.controller';
// import { ContentService } from './content.service';
// import { RpcException } from '@nestjs/microservices';
// import { CreateContentDto } from './dto/create-content.dto';
// import { Content } from '../../models/content.model';

// describe('ContentController', () => {
//   let controller: ContentController;
//   //   let contentService: ContentService;
//   //   let authClient: ClientProxy;

//   const mockContentService = {
//     create: jest.fn(),
//   };

//   const mockAuthClient = {
//     send: jest.fn(),
//   };

//   beforeEach(async () => {
//     const module: TestingModule = await Test.createTestingModule({
//       controllers: [ContentController],
//       providers: [
//         { provide: ContentService, useValue: mockContentService },
//         { provide: 'AUTH_SERVICE', useValue: mockAuthClient },
//       ],
//     }).compile();

//     controller = module.get<ContentController>(ContentController);
//     //  contentService = module.get<ContentService>(ContentService);
//     //  authClient = module.get<ClientProxy>('AUTH_SERVICE');
//   });

//   it('should be defined', () => {
//     expect(controller).toBeDefined();
//   });

//   describe('create', () => {
//     it('should create content successfully', async () => {
//       const createContentDto: CreateContentDto = {
//         title: 'Test Content',
//         body: 'This is a test content body',
//         type: 'article',
//         author: 'Test Author',
//       };

//       const expectedResult: Partial<Content> = {
//         ...createContentDto,
//         status: 'draft',
//         //   _id: 'someId',
//       };

//       mockContentService.create.mockResolvedValue(expectedResult);

//       const result = await controller.create(createContentDto);

//       expect(result).toEqual(expectedResult);
//       expect(mockContentService.create).toHaveBeenCalledWith(createContentDto);
//     });

//     it('should throw RpcException when content creation fails', async () => {
//       const createContentDto: CreateContentDto = {
//         title: 'Test Content',
//         body: 'This is a test content body',
//         type: 'article',
//         author: 'Test Author',
//       };

//       const error = new Error('Content creation failed');
//       mockContentService.create.mockRejectedValue(error);

//       await expect(controller.create(createContentDto)).rejects.toThrow(RpcException);
//       expect(mockContentService.create).toHaveBeenCalledWith(createContentDto);
//     });

//     it('should log the creation process', async () => {
//       const createContentDto: CreateContentDto = {
//         title: 'Test Content',
//         body: 'This is a test content body',
//         type: 'article',
//         author: 'Test Author',
//       };

//       const logSpy = jest.spyOn(controller['logger'], 'log');
//       mockContentService.create.mockResolvedValue({ ...createContentDto, _id: 'someId' });

//       await controller.create(createContentDto);

//       expect(logSpy).toHaveBeenCalledWith(
//         `Creating new content: ${JSON.stringify(createContentDto)}`,
//       );
//       expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('Content created successfully'));
//     });

//     it('should log errors during content creation', async () => {
//       const createContentDto: CreateContentDto = {
//         title: 'Test Content',
//         body: 'This is a test content body',
//         type: 'article',
//         author: 'Test Author',
//       };

//       const error = new Error('Content creation failed');
//       mockContentService.create.mockRejectedValue(error);

//       const errorSpy = jest.spyOn(controller['logger'], 'error');

//       await expect(controller.create(createContentDto)).rejects.toThrow(RpcException);

//       expect(errorSpy).toHaveBeenCalledWith(
//         `Error creating content: ${error.message}`,
//         error.stack,
//       );
//     });
//   });
// });
