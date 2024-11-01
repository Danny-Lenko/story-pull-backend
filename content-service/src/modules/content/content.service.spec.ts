import { Test, TestingModule } from '@nestjs/testing';
import { ContentService } from './content.service';
import { getModelToken } from '@nestjs/mongoose';
import { Content } from '../../models/content.model';
import { CreateContentDto } from './dto/create-content.dto';
import { lastValueFrom } from 'rxjs';

describe('ContentService', () => {
  let service: ContentService;

  const mockContentModel = {
    create: jest.fn(),
    find: jest.fn(),
    findById: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ContentService,
        {
          provide: getModelToken(Content.name),
          useValue: mockContentModel,
        },
      ],
    }).compile();

    service = module.get<ContentService>(ContentService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new content item with default status', async () => {
      const createContentDto: CreateContentDto = {
        title: 'Test Content',
        body: 'This is a test content body',
        type: 'article',
        author: 'Test Author',
      };

      const createdContent: Partial<Content> = {
        ...createContentDto,
        status: 'draft',
      };

      mockContentModel.create.mockResolvedValue(createdContent);

      const result = await lastValueFrom(service.create(createContentDto));

      expect(result).toEqual(createdContent);
      expect(mockContentModel.create).toHaveBeenCalledWith({
        ...createContentDto,
        status: 'draft',
        publishedAt: null,
      });
    });

    it('should create a new content item with provided status and set publishedAt for published content', async () => {
      const createContentDto: CreateContentDto = {
        title: 'Test Content',
        body: 'This is a test content body',
        type: 'article',
        author: 'Test Author',
        status: 'published',
      };

      const createdContent: Partial<Content> = {
        ...createContentDto,
        publishedAt: expect.any(Date),
      };

      mockContentModel.create.mockResolvedValue(createdContent);

      const result = await lastValueFrom(service.create(createContentDto));

      expect(result).toEqual(createdContent);
      expect(mockContentModel.create).toHaveBeenCalledWith({
        ...createContentDto,
        publishedAt: expect.any(Date),
      });
    });
  });

  describe('findAll', () => {
    it('should return an array of content items', async () => {
      const mockContentItems: Partial<Content>[] = [
        { title: 'Content 1', body: 'Body 1', type: 'article', author: 'Author 1' },
        { title: 'Content 2', body: 'Body 2', type: 'page', author: 'Author 2' },
      ];

      mockContentModel.find.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockContentItems),
      });

      const result = await service.findAll();

      expect(result).toEqual(mockContentItems);
      expect(mockContentModel.find).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a single content item by id', async () => {
      const mockContentItem: Partial<Content> = {
        title: 'Test Content',
        body: 'Test Body',
        type: 'article',
        author: 'Test Author',
      };

      mockContentModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockContentItem),
      });

      const result = await service.findOne('someId');

      expect(result).toEqual(mockContentItem);
      expect(mockContentModel.findById).toHaveBeenCalledWith('someId');
    });

    it('should return null if content item is not found', async () => {
      mockContentModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      const result = await service.findOne('nonExistentId');

      expect(result).toBeNull();
      expect(mockContentModel.findById).toHaveBeenCalledWith('nonExistentId');
    });
  });
});

// import { Test, TestingModule } from '@nestjs/testing';
// import { ContentService } from './content.service';
// import { getModelToken } from '@nestjs/mongoose';
// import { Content } from '../../models/content.model';
// import { CreateContentDto } from './dto/create-content.dto';

// describe('ContentService', () => {
//   let service: ContentService;

//   const mockContentModel = {
//     create: jest.fn(),
//     find: jest.fn(),
//     findById: jest.fn(),
//   };

//   beforeEach(async () => {
//     const module: TestingModule = await Test.createTestingModule({
//       providers: [
//         ContentService,
//         {
//           provide: getModelToken(Content.name),
//           useValue: mockContentModel,
//         },
//       ],
//     }).compile();

//     service = module.get<ContentService>(ContentService);
//   });

//   it('should be defined', () => {
//     expect(service).toBeDefined();
//   });

//   describe('create', () => {
//     it('should create a new content item with default status', async () => {
//       const createContentDto: CreateContentDto = {
//         title: 'Test Content',
//         body: 'This is a test content body',
//         type: 'article',
//         author: 'Test Author',
//       };

//       const createdContent: Partial<Content> = {
//         ...createContentDto,
//         status: 'draft',
//       };

//       mockContentModel.create.mockResolvedValue(createdContent);

//       const result = await service.create(createContentDto);

//       expect(result).toEqual(createdContent);
//       expect(mockContentModel.create).toHaveBeenCalledWith({
//         ...createContentDto,
//         status: 'draft',
//         publishedAt: null,
//       });
//     });

//     it('should create a new content item with provided status and set publishedAt for published content', async () => {
//       const createContentDto: CreateContentDto = {
//         title: 'Test Content',
//         body: 'This is a test content body',
//         type: 'article',
//         author: 'Test Author',
//         status: 'published',
//       };

//       const createdContent: Partial<Content> = {
//         ...createContentDto,
//         publishedAt: expect.any(Date),
//       };

//       mockContentModel.create.mockResolvedValue(createdContent);

//       const result = await service.create(createContentDto);

//       expect(result).toEqual(createdContent);
//       expect(mockContentModel.create).toHaveBeenCalledWith({
//         ...createContentDto,
//         publishedAt: expect.any(Date),
//       });
//     });
//   });

//   describe('findAll', () => {
//     it('should return an array of content items', async () => {
//       const mockContentItems: Partial<Content>[] = [
//         { title: 'Content 1', body: 'Body 1', type: 'article', author: 'Author 1' },
//         { title: 'Content 2', body: 'Body 2', type: 'page', author: 'Author 2' },
//       ];

//       mockContentModel.find.mockReturnValue({
//         exec: jest.fn().mockResolvedValue(mockContentItems),
//       });

//       const result = await service.findAll();

//       expect(result).toEqual(mockContentItems);
//       expect(mockContentModel.find).toHaveBeenCalled();
//     });
//   });

//   describe('findOne', () => {
//     it('should return a single content item by id', async () => {
//       const mockContentItem: Partial<Content> = {
//         title: 'Test Content',
//         body: 'Test Body',
//         type: 'article',
//         author: 'Test Author',
//       };

//       mockContentModel.findById.mockReturnValue({
//         exec: jest.fn().mockResolvedValue(mockContentItem),
//       });

//       const result = await service.findOne('someId');

//       expect(result).toEqual(mockContentItem);
//       expect(mockContentModel.findById).toHaveBeenCalledWith('someId');
//     });

//     it('should return null if content item is not found', async () => {
//       mockContentModel.findById.mockReturnValue({
//         exec: jest.fn().mockResolvedValue(null),
//       });

//       const result = await service.findOne('nonExistentId');

//       expect(result).toBeNull();
//       expect(mockContentModel.findById).toHaveBeenCalledWith('nonExistentId');
//     });
//   });
// });
