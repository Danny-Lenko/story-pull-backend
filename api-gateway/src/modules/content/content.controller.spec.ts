import { Test, TestingModule } from '@nestjs/testing';
import { ContentController } from './content.controller';
import { ClientProxy } from '@nestjs/microservices';
import { of, throwError } from 'rxjs';
import { CreateContentDto, QueryContentDto, UpdateContentDto } from '@story-pull/types';
import { HttpException } from '@nestjs/common';

describe('ContentController', () => {
  let controller: ContentController;
  let clientProxyMock: jest.Mocked<ClientProxy>;

  beforeEach(async () => {
    clientProxyMock = {
      send: jest.fn(),
      emit: jest.fn(),
    } as unknown as jest.Mocked<ClientProxy>;

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ContentController],
      providers: [
        {
          provide: 'CONTENT_SERVICE',
          useValue: clientProxyMock,
        },
      ],
    }).compile();

    controller = module.get<ContentController>(ContentController);
  });

  describe('register', () => {
    it('should send the createContent command and return the response', (done) => {
      const createContentDto: CreateContentDto = {
        title: 'Test Title',
        body: 'Test Body',
        type: 'article',
        author: 'Test Author',
      };
      const token = 'Bearer test-token';
      const response = { success: true };

      clientProxyMock.send.mockReturnValue(of(response));

      controller.register(createContentDto, token).subscribe((result) => {
        expect(clientProxyMock.send).toHaveBeenCalledWith(
          { cmd: 'createContent' },
          { data: createContentDto, userId: token },
        );
        expect(result).toEqual(response);
        done();
      });
    });

    it('should handle an error thrown by the client proxy', (done) => {
      const createContentDto: CreateContentDto = {
        title: 'Test Title',
        body: 'Test Body',
        type: 'article',
        author: 'Test Author',
      };
      const token = 'Bearer test-token';
      const error = new HttpException('An unexpected error occurred', 500);

      clientProxyMock.send.mockReturnValue(throwError(() => error));

      controller.register(createContentDto, token).subscribe({
        error: (err) => {
          expect(clientProxyMock.send).toHaveBeenCalledWith(
            { cmd: 'createContent' },
            { data: createContentDto, userId: token },
          );
          expect(err).toEqual(error);
          done();
        },
      });
    });
  });

  describe('getPaginatedContent', () => {
    it('should send the findAllContent command and return the response', (done) => {
      const queryContentDto: QueryContentDto = { page: 1, limit: 10 };
      const token = 'Bearer test-token';
      const response = { items: [], total: 0 };

      clientProxyMock.send.mockReturnValue(of(response));

      controller.getPaginatedContent(queryContentDto, token).subscribe((result) => {
        expect(clientProxyMock.send).toHaveBeenCalledWith(
          { cmd: 'findAllContent' },
          { data: queryContentDto, userId: token },
        );

        expect(result).toEqual(response);
        done();
      });
    });
  });

  describe('getContentById', () => {
    it('should send the findContentById command and return the response', (done) => {
      const id = 'test-id';
      const token = 'Bearer test-token';
      const response = { id, title: 'Test Title', body: 'Test Body' };

      clientProxyMock.send.mockReturnValue(of(response));

      controller.getContentById(id, token).subscribe((result) => {
        expect(clientProxyMock.send).toHaveBeenCalledWith(
          { cmd: 'findContentById' },
          { id, userId: token },
        );
        expect(result).toEqual(response);
        done();
      });
    });
  });

  describe('updateContent', () => {
    it('should send the updateContent command and return the response', (done) => {
      const id = 'test-id';
      const updateDto: UpdateContentDto = { title: 'Updated Title', body: 'Updated Body' };
      const token = 'Bearer test-token';
      const response = { success: true };

      clientProxyMock.send.mockReturnValue(of(response));

      controller.updateContent(id, updateDto, token).subscribe((result) => {
        expect(clientProxyMock.send).toHaveBeenCalledWith(
          { cmd: 'updateContent' },
          { id, data: updateDto, userId: token },
        );
        expect(result).toEqual(response);
        done();
      });
    });
  });
});
