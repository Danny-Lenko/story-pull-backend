import { Test, TestingModule } from '@nestjs/testing';
import { MongooseModule } from '@nestjs/mongoose';
import { Model, Connection } from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { Content, ContentDocument, ContentSchema } from './content.model';
import { getConnectionToken } from '@nestjs/mongoose';

describe('Content Model', () => {
  let contentModel: Model<ContentDocument>;
  let mongoMemoryServer: MongoMemoryServer;
  let moduleRef: TestingModule;
  let connection: Connection;

  beforeAll(async () => {
    mongoMemoryServer = await MongoMemoryServer.create();
    const uri = mongoMemoryServer.getUri();

    moduleRef = await Test.createTestingModule({
      imports: [
        MongooseModule.forRoot(uri),
        MongooseModule.forFeature([{ name: Content.name, schema: ContentSchema }]),
      ],
    }).compile();

    contentModel = moduleRef.get<Model<ContentDocument>>(`${Content.name}Model`);
    connection = moduleRef.get<Connection>(getConnectionToken());
  });

  afterAll(async () => {
    await connection.close();
    await moduleRef.close();
    await mongoMemoryServer.stop();
  });

  beforeEach(async () => {
    await contentModel.deleteMany({});
  });

  it('should be defined', () => {
    expect(contentModel).toBeDefined();
  });

  it('should create a valid content item', async () => {
    const contentData = {
      title: 'Test Content',
      body: 'This is a test content body',
      type: 'article',
      authorId: 'someUserId',
      author: 'Test Author',
      status: 'draft',
      tags: ['test', 'content'],
      seo: {
        metaTitle: 'Test Meta Title',
        metaDescription: 'Test Meta Description',
      },
    };

    const content = new contentModel(contentData);
    await expect(content.validate()).resolves.toBeUndefined();
  });

  it('should fail validation for invalid content type', async () => {
    const invalidContent = new contentModel({
      title: 'Invalid Content',
      body: 'This content has an invalid type',
      type: 'invalid_type',
      author: 'Test Author',
    });

    await expect(invalidContent.validate()).rejects.toThrow();
  });

  it('should generate a correct slug', async () => {
    const content = new contentModel({
      title: 'This is a Test Title',
      body: 'Test body',
      type: 'article',
      authorId: 'someUserId',
      author: 'Test Author',
    });

    await content.save();
    const savedContent = await contentModel.findById(content._id);

    expect(savedContent?.slug).toBe('this-is-a-test-title');
  });

  // Add more tests as needed
});
