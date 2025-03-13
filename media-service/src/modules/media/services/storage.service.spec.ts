import { Test, TestingModule } from '@nestjs/testing';
import { StorageService } from './storage.service';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import { lastValueFrom } from 'rxjs';
import * as path from 'path';
import * as mimeTypes from 'mime-types';
import { MediaAssetService } from './media-asset.service';
import { NotFoundException } from '@nestjs/common';

jest.mock('fs', () => ({
  mkdir: jest.fn(),
  writeFile: jest.fn(), // We'll mock this using Node callback style
  existsSync: jest.fn(),
  promises: {
    unlink: jest.fn(),
  },
}));

jest.mock('mime-types', () => ({
  lookup: jest.fn(),
}));

describe('StorageService', () => {
  let service: StorageService;
  const mockConfigService = { get: jest.fn() };
  const mockMediaAssetService = {
    createMediaAsset: jest.fn(),
    deleteMediaAsset: jest.fn(),
  };

  beforeEach(async () => {
    // Configure the base upload directory for testing
    mockConfigService.get.mockImplementation((key: string) => {
      if (key === 'UPLOAD_DIR') return '/uploads';
      return null;
    });

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StorageService,
        { provide: ConfigService, useValue: mockConfigService },
        { provide: MediaAssetService, useValue: mockMediaAssetService },
      ],
    }).compile();

    service = module.get<StorageService>(StorageService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('saveFile', () => {
    it('should save the file successfully', async () => {
      const mockFile = {
        originalname: 'test.txt',
        buffer: Buffer.from('data'),
        mimetype: 'text/plain',
        size: 1234,
      } as Express.Multer.File;

      // Mock fs.writeFile to call the callback with no error
      (fs.writeFile as unknown as jest.Mock).mockImplementation((_path, _buffer, callback) =>
        callback(null),
      );

      const result = await lastValueFrom(
        service.saveFile({ file: mockFile, storedFilename: '123456789-test.txt' }),
      );

      // The promisified writeFile returns undefined on success.
      expect(result).toBeUndefined();
      expect(fs.writeFile).toHaveBeenCalled();
    });

    it('should throw an error during file save', async () => {
      const mockFile = {
        originalname: 'test.txt',
        buffer: Buffer.from('data'),
        mimetype: 'text/plain',
        size: 1234,
      } as Express.Multer.File;

      // Simulate an error by calling the callback with an error
      (fs.writeFile as unknown as jest.Mock).mockImplementation((_path, _buffer, callback) =>
        callback(new Error('Error saving file')),
      );

      await expect(
        lastValueFrom(service.saveFile({ file: mockFile, storedFilename: '123456789-test.txt' })),
      ).rejects.toThrow('Error saving file');

      // Since cleanup is now handled in the controller, these should not be called by the service.
      expect(fs.promises.unlink).not.toHaveBeenCalled();
      expect(mockMediaAssetService.deleteMediaAsset).not.toHaveBeenCalled();
    });
  });

  describe('getFile', () => {
    it('should return file metadata', async () => {
      const filename = 'test.txt';
      const mimeType = 'text/plain';
      const directory = 'documents';
      const filePath = path.join('/uploads', directory, filename);

      (fs.existsSync as jest.Mock).mockReturnValue(true);
      (mimeTypes.lookup as jest.Mock).mockReturnValue(mimeType);

      const result = await lastValueFrom(service.getFile(filename));
      expect(result).toEqual({ filePath, mimeType });
    });

    it('should throw NotFoundException if file does not exist', async () => {
      const filename = 'nonexistent.txt';
      (fs.existsSync as jest.Mock).mockReturnValue(false);

      await expect(lastValueFrom(service.getFile(filename))).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException if file type is not supported', async () => {
      const filename = 'unsupported.file';
      const mimeType = 'application/octet-stream';

      (fs.existsSync as jest.Mock).mockReturnValue(true);
      (mimeTypes.lookup as jest.Mock).mockReturnValue(mimeType);

      await expect(lastValueFrom(service.getFile(filename))).rejects.toThrow(NotFoundException);
    });
  });
});
