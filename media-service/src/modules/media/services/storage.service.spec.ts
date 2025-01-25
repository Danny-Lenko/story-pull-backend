import { Test, TestingModule } from '@nestjs/testing';
import { StorageService } from './storage.service';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import { lastValueFrom } from 'rxjs';
import * as path from 'path';

jest.mock('fs', () => ({
  mkdir: jest.fn(),
  writeFile: jest.fn(),
  existsSync: jest.fn(),
}));

describe('StorageService', () => {
  let service: StorageService;
  const mockConfigService = { get: jest.fn() };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [StorageService, { provide: ConfigService, useValue: mockConfigService }],
    }).compile();

    service = module.get<StorageService>(StorageService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('saveFile', () => {
    it('should save the file and return the filename', async () => {
      const mockFile = {
        originalname: 'test.txt',
        buffer: Buffer.from('data'),
      } as Express.Multer.File;
      // const expectedFilename = `${Date.now()}-test.txt`;
      (fs.writeFile as unknown as jest.Mock).mockImplementation((_path, _buffer, callback) =>
        callback(null),
      );

      const result = await lastValueFrom(service.saveFile(mockFile));
      expect(result).toMatch(/-test\.txt$/);
    });

    it('should handle errors during file save', async () => {
      const mockFile = {
        originalname: 'test.txt',
        buffer: Buffer.from('data'),
      } as Express.Multer.File;
      (fs.writeFile as unknown as jest.Mock).mockImplementation((_path, _buffer, callback) =>
        callback(new Error('Error saving file')),
      );

      await expect(lastValueFrom(service.saveFile(mockFile))).rejects.toThrow('Error saving file');
    });
  });

  describe('getFile', () => {
    it('should return file metadata', async () => {
      const filename = 'test.txt';
      const filePath = path.join(service['uploadDir'], filename);
      (fs.existsSync as jest.Mock).mockReturnValue(true);

      const result = await lastValueFrom(service.getFile(filename));
      expect(result).toEqual({ filePath, mimeType: 'text/plain' });
    });

    it('should throw NotFoundException if file does not exist', async () => {
      const filename = 'nonexistent.txt';
      (fs.existsSync as jest.Mock).mockReturnValue(false);

      await expect(lastValueFrom(service.getFile(filename))).rejects.toThrow('File not found');
    });
  });
});
