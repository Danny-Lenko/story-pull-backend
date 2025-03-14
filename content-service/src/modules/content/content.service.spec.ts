import { Test, TestingModule } from '@nestjs/testing';
import { ContentService } from './content.service';
import { getModelToken } from '@nestjs/mongoose';
import { Content, ContentDocument } from '../../models/content.model';
import { lastValueFrom } from 'rxjs';
import { Model } from 'mongoose';
import { BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { CreateContentDto, QueryContentDto, UpdateContentDto } from '@story-pull/types';

describe('ContentService', () => {
  let service: ContentService;
  let model: Model<ContentDocument>;

  const mockContent = {
    id: '507f1f77bcf86cd799439011',
    title: 'Test Content',
    body: 'Test Body',
    type: 'article',
    author: 'Test Author',
    authorId: 'someUserId',
    status: 'published',
  };

  const mockContentModel = {
    create: jest.fn(),
    find: jest.fn(),
    findById: jest.fn(),
    countDocuments: jest.fn(),
  };

  const mockExecFunction = jest.fn();

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
    model = module.get<Model<ContentDocument>>(getModelToken(Content.name));

    mockContentModel.find.mockReturnValue({
      sort: jest.fn().mockReturnValue({
        skip: jest.fn().mockReturnValue({
          limit: jest.fn().mockReturnValue({
            exec: mockExecFunction,
          }),
        }),
      }),
    });
    mockContentModel.countDocuments.mockResolvedValue(0);
  });

  afterEach(() => {
    jest.clearAllMocks();
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

      const result = await lastValueFrom(
        service.create({ createContentDto, userId: 'someUserId' }),
      );

      expect(result).toEqual(createdContent);
      expect(mockContentModel.create).toHaveBeenCalledWith({
        ...createContentDto,
        status: 'draft',
        publishedAt: null,
        authorId: 'someUserId',
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

      const result = await lastValueFrom(
        service.create({ createContentDto, userId: 'someUserId' }),
      );

      expect(result).toEqual(createdContent);
      expect(mockContentModel.create).toHaveBeenCalledWith({
        ...createContentDto,
        publishedAt: expect.any(Date),
        authorId: 'someUserId',
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

  describe('findById', () => {
    it('should return content when valid ID is provided', (done) => {
      mockContentModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockContent),
      });

      service.findById({ id: mockContent.id, userId: 'someUserId' }).subscribe({
        next: (content) => {
          expect(content).toEqual(mockContent);
          expect(model.findById).toHaveBeenCalledWith(mockContent.id);
          done();
        },
        error: done,
      });
    });

    it('should throw NotFoundException when content is not found', (done) => {
      mockContentModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      service.findById({ id: 'nonexistent-id', userId: 'someUserId' }).subscribe({
        error: (error) => {
          expect(error).toBeInstanceOf(NotFoundException);
          expect(error.message).toBe('Content with ID "nonexistent-id" not found');
          done();
        },
      });
    });

    it('should handle invalid MongoDB ID format', (done) => {
      mockContentModel.findById.mockReturnValue({
        exec: jest.fn().mockRejectedValue({ name: 'CastError' }),
      });

      service.findById({ id: 'invalid-id', userId: 'someUserId' }).subscribe({
        error: (error) => {
          expect(error).toBeInstanceOf(NotFoundException);
          expect(error.message).toBe('Invalid content ID format');
          done();
        },
      });
    });

    it('should propagate unexpected errors', (done) => {
      const unexpectedError = new Error('Database connection failed');
      mockContentModel.findById.mockReturnValue({
        exec: jest.fn().mockRejectedValue(unexpectedError),
      });

      service.findById({ id: mockContent.id, userId: 'someUserId' }).subscribe({
        error: (error) => {
          expect(error).toBe(unexpectedError);
          expect(error.message).toBe('Database connection failed');
          done();
        },
      });
    });
  });

  describe('findAllPaginated - Filter Tests', () => {
    it('should apply text search filter', (done) => {
      const query: QueryContentDto = {
        search: 'test content',
      };

      mockExecFunction.mockResolvedValue([]);
      mockContentModel.countDocuments.mockResolvedValue(0);

      service.findAllPaginated({ query, userId: 'someUserId' }).subscribe({
        next: () => {
          expect(mockContentModel.find).toHaveBeenCalledWith(
            expect.objectContaining({
              $text: { $search: 'test content' },
            }),
          );
          done();
        },
        error: done,
      });
    });

    it('should apply date range filter', (done) => {
      const dateFrom = new Date('2024-01-01');
      const dateTo = new Date('2024-02-01');
      const query: QueryContentDto = { dateFrom, dateTo };

      mockExecFunction.mockResolvedValue([]);
      mockContentModel.countDocuments.mockResolvedValue(0);

      service.findAllPaginated({ query, userId: 'someUserId' }).subscribe({
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        next: (result) => {
          expect(mockContentModel.find).toHaveBeenCalledWith(
            expect.objectContaining({
              createdAt: {
                $gte: dateFrom,
                $lte: dateTo,
              },
            }),
          );
          done();
        },
        error: done,
      });
    });

    it('should apply multiple status filter', (done) => {
      const query: QueryContentDto = {
        status: ['published', 'draft'],
      };

      mockExecFunction.mockResolvedValue([]);
      mockContentModel.countDocuments.mockResolvedValue(0);

      service.findAllPaginated({ query, userId: 'someUserId' }).subscribe({
        next: () => {
          expect(mockContentModel.find).toHaveBeenCalledWith(
            expect.objectContaining({
              status: { $in: ['published', 'draft'] },
            }),
          );
          done();
        },
        error: done,
      });
    });

    it('should apply tags filter', (done) => {
      const query: QueryContentDto = {
        tags: ['javascript', 'nodejs'],
      };

      mockExecFunction.mockResolvedValue([]);
      mockContentModel.countDocuments.mockResolvedValue(0);

      service.findAllPaginated({ query, userId: 'someUserId' }).subscribe({
        next: () => {
          expect(mockContentModel.find).toHaveBeenCalledWith(
            expect.objectContaining({
              tags: { $all: ['javascript', 'nodejs'] },
            }),
          );
          done();
        },
        error: done,
      });
    });

    it('should apply combined filters', (done) => {
      const dateFrom = new Date('2024-01-01');
      const query: QueryContentDto = {
        search: 'test',
        type: 'article',
        status: ['published'],
        tags: ['javascript'],
        dateFrom,
      };

      mockExecFunction.mockResolvedValue([]);
      mockContentModel.countDocuments.mockResolvedValue(0);

      service.findAllPaginated({ query, userId: 'someUserId' }).subscribe({
        next: () => {
          expect(mockContentModel.find).toHaveBeenCalledWith(
            expect.objectContaining({
              $text: { $search: 'test' },
              type: 'article',
              status: { $in: ['published'] },
              tags: { $all: ['javascript'] },
              createdAt: { $gte: dateFrom },
            }),
          );
          done();
        },
        error: done,
      });
    });

    it('should handle pagination with filters', (done) => {
      const query: QueryContentDto = {
        type: 'article',
        page: 2,
        limit: 5,
      };

      const mockFindFunction = jest.fn().mockReturnValue({
        skip: jest.fn().mockReturnValue({
          limit: jest.fn().mockReturnValue({
            exec: jest.fn().mockResolvedValue([]),
          }),
        }),
      });

      mockContentModel.find.mockReturnValue({
        sort: jest.fn().mockReturnValue(mockFindFunction()),
      });
      mockContentModel.countDocuments.mockResolvedValue(15);

      service.findAllPaginated({ query, userId: 'someUserId' }).subscribe({
        next: (response) => {
          expect(response.meta.pagination).toEqual({
            total: 15,
            page: 2,
            lastPage: 3,
            limit: 5,
          });
          done();
        },
        error: done,
      });
    });

    it('should handle empty result set', (done) => {
      const query: QueryContentDto = {
        search: 'nonexistent',
      };

      mockExecFunction.mockResolvedValue([]);
      mockContentModel.countDocuments.mockResolvedValue(0);

      service.findAllPaginated({ query, userId: 'someUserId' }).subscribe({
        next: (response) => {
          expect(response.data).toEqual([]);
          expect(response.meta.pagination.total).toBe(0);
          expect(response.meta.pagination.lastPage).toBe(0);
          done();
        },
        error: done,
      });
    });

    it('should preserve filter metadata in response', (done) => {
      const query: QueryContentDto = {
        search: 'test',
        tags: ['javascript'],
      };

      mockExecFunction.mockResolvedValue([]);
      mockContentModel.countDocuments.mockResolvedValue(0);

      service.findAllPaginated({ query, userId: 'someUserId' }).subscribe({
        next: (response) => {
          expect(response.meta.filter.applied).toContain('text_search');
          expect(response.meta.filter.applied).toContain('tags');
          expect(response.meta.filter.available).toEqual(
            expect.arrayContaining([
              'text_search',
              'type',
              'status',
              'tags',
              'date_from',
              'date_to',
            ]),
          );
          done();
        },
        error: done,
      });
    });
  });

  describe('update', () => {
    let service: ContentService;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    let model: Model<ContentDocument>;

    const mockContentModel = {
      findById: jest.fn(),
      findByIdAndUpdate: jest.fn(),
    };

    const mockContent = {
      _id: '507f1f77bcf86cd799439011',
      title: 'Existing Content',
      body: 'Existing Body',
      type: 'article',
      author: 'Test Author',
      status: 'draft',
      authorId: 'someUserId',
      publishedAt: null,
      updatedAt: new Date(),
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
      model = module.get<Model<ContentDocument>>(getModelToken(Content.name));
    });

    afterEach(() => {
      jest.clearAllMocks();
    });

    it('should update an existing content item and return the updated content', (done) => {
      const updateDto: UpdateContentDto = { title: 'Updated Title', status: 'published' };
      const updatedContent = { ...mockContent, ...updateDto, publishedAt: expect.any(Date) };

      mockContentModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockContent),
      });

      mockContentModel.findByIdAndUpdate.mockReturnValue({
        exec: jest.fn().mockResolvedValue(updatedContent),
      });

      service
        .update({ id: mockContent._id, updateContentDto: updateDto, userId: 'someUserId' })
        .subscribe({
          next: (result) => {
            expect(result).toEqual(updatedContent);
            expect(mockContentModel.findById).toHaveBeenCalledWith(mockContent._id);
            expect(mockContentModel.findByIdAndUpdate).toHaveBeenCalledWith(
              mockContent._id,
              { $set: expect.objectContaining({ ...updateDto, updatedAt: expect.any(Date) }) },
              { new: true, runValidators: true },
            );
            done();
          },
          error: done,
        });
    });

    it('should throw ForbiddenException when user does not have access', (done) => {
      const updateDto: UpdateContentDto = { title: 'Updated Title', status: 'draft' };

      mockContentModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue({
          ...mockContent,
          authorId: 'differentUserId', // Different user ID
          status: 'draft',
        }),
      });

      service
        .update({ id: mockContent._id, updateContentDto: updateDto, userId: 'someUserId' })
        .subscribe({
          next: () => done.fail('Should have thrown ForbiddenException'),
          error: (error) => {
            expect(error).toBeInstanceOf(ForbiddenException);
            expect(error.message).toBe('You do not have access to this content');
            done();
          },
        });
    });

    it('should throw NotFoundException if the content does not exist', (done) => {
      const updateDto: UpdateContentDto = { title: 'Updated Title' };

      mockContentModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      service
        .update({ id: mockContent._id, updateContentDto: updateDto, userId: 'someUserId' })
        .subscribe({
          error: (error) => {
            expect(error).toBeInstanceOf(NotFoundException);
            expect(error.message).toBe(`Content with ID "${mockContent._id}" not found`);
            done();
          },
        });
    });

    it('should throw BadRequestException on validation errors', (done) => {
      const updateDto: UpdateContentDto = { title: '' }; // Invalid title
      const validationError = { name: 'ValidationError', message: 'Validation failed' };

      mockContentModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockContent),
      });

      mockContentModel.findByIdAndUpdate.mockReturnValue({
        exec: jest.fn().mockRejectedValue(validationError),
      });

      service
        .update({ id: mockContent._id, updateContentDto: updateDto, userId: 'someUserId' })
        .subscribe({
          error: (error) => {
            expect(error).toBeInstanceOf(BadRequestException);
            expect(error.message).toBe('Validation failed');
            done();
          },
        });
    });

    it('should throw NotFoundException on invalid ID format', (done) => {
      const updateDto: UpdateContentDto = { title: 'Updated Title' };
      const castError = { name: 'CastError' };

      mockContentModel.findById.mockReturnValue({
        exec: jest.fn().mockRejectedValue(castError),
      });

      service
        .update({ id: mockContent._id, updateContentDto: updateDto, userId: 'someUserId' })
        .subscribe({
          error: (error) => {
            expect(error).toBeInstanceOf(NotFoundException);
            expect(error.message).toBe('Invalid content ID format');
            done();
          },
        });
    });

    it('should propagate unexpected errors', (done) => {
      const updateDto: UpdateContentDto = { title: 'Updated Title' };
      const unexpectedError = new Error('Unexpected error');

      mockContentModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockContent),
      });

      mockContentModel.findByIdAndUpdate.mockReturnValue({
        exec: jest.fn().mockRejectedValue(unexpectedError),
      });

      service
        .update({ id: mockContent._id, updateContentDto: updateDto, userId: 'someUserId' })
        .subscribe({
          error: (error) => {
            expect(error).toBe(unexpectedError);
            expect(error.message).toBe('Unexpected error');
            done();
          },
        });
    });
  });
});
