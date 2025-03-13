import { Test, TestingModule } from '@nestjs/testing';
import { MediaController } from './media.controller';
import { ClientProxy } from '@nestjs/microservices';
import { of } from 'rxjs';
import { Logger, StreamableFile } from '@nestjs/common';
import { createReadStream } from 'fs';
import { Response } from 'express';

// Mocking the 'fs' module
jest.mock('fs', () => ({
  createReadStream: jest.fn(),
}));

describe('MediaController', () => {
  let controller: MediaController;
  let mediaServiceMock: jest.Mocked<ClientProxy>;
  let loggerMock: jest.Mocked<Logger>;

  beforeEach(async () => {
    mediaServiceMock = {
      send: jest.fn(),
      // If you use emit as well, add it:
      emit: jest.fn(),
    } as unknown as jest.Mocked<ClientProxy>;

    loggerMock = {
      log: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
      debug: jest.fn(),
      verbose: jest.fn(),
    } as unknown as jest.Mocked<Logger>;

    const module: TestingModule = await Test.createTestingModule({
      controllers: [MediaController],
      providers: [
        {
          provide: 'MEDIA_SERVICE',
          useValue: mediaServiceMock,
        },
        {
          provide: Logger,
          useValue: loggerMock,
        },
      ],
    }).compile();

    controller = module.get<MediaController>(MediaController);
  });

  describe('uploadFile', () => {
    it('should send the uploadFile command and return the response', (done) => {
      const file: Express.Multer.File = {
        fieldname: 'file',
        originalname: 'test.txt',
        encoding: 'utf8',
        mimetype: 'text/plain',
        buffer: Buffer.from('test content'),
        size: 12,
        stream: undefined, // not used in this test
      } as Express.Multer.File;

      const userId = 'user-123';
      const response = { success: true };

      mediaServiceMock.send.mockReturnValue(of(response));

      controller.uploadFile(file, userId).subscribe((res) => {
        // Verify that logging occurred
        expect(loggerMock.log).toHaveBeenCalledWith(
          `User ${userId} uploaded file ${file.originalname}`,
        );
        // Verify that mediaService.send was called with the correct parameters
        expect(mediaServiceMock.send).toHaveBeenCalledWith({ cmd: 'uploadFile' }, { file, userId });
        expect(res).toEqual(response);
        done();
      });
    });
  });

  describe('getFile', () => {
    let responseMock: Partial<Response>;

    beforeEach(() => {
      responseMock = {
        set: jest.fn(),
      } as unknown as Response;
    });

    it('should return a StreamableFile if the file is found', async () => {
      const filename = 'test.txt';
      const filePath = '/path/to/test.txt';
      const mimeType = 'text/plain';
      const fakeStream = { on: jest.fn() }; // simple mock for stream

      // Set up the mock for createReadStream
      (createReadStream as jest.Mock).mockReturnValue(fakeStream);

      // mediaService.send returns file details
      mediaServiceMock.send.mockReturnValue(of({ filePath, mimeType }));

      const result = await controller.getFile(filename, responseMock as Response);

      expect(mediaServiceMock.send).toHaveBeenCalledWith({ cmd: 'getFile' }, filename);
      expect(responseMock.set).toHaveBeenCalledWith({
        'Content-Type': mimeType,
        'Content-Disposition': `inline; filename="${filename}"`,
      });
      expect(result).toBeInstanceOf(StreamableFile);
      // Optionally, you can verify that the StreamableFile contains our fakeStream,
      // for example, if there is a method to access the stream.
    });

    it('should throw an error if the file is not found', async () => {
      const filename = 'nonexistent.txt';
      // Return an object without filePath and mimeType
      mediaServiceMock.send.mockReturnValue(of({}));

      await expect(controller.getFile(filename, responseMock as Response)).rejects.toThrow(
        'File not found',
      );
    });
  });
});
