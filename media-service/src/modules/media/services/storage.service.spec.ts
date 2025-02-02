import { Test, TestingModule } from '@nestjs/testing';
import { StorageService } from './storage.service';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import { lastValueFrom, of } from 'rxjs';
import * as path from 'path';
import * as mimeTypes from 'mime-types';
import { MediaAssetService } from './media-asset.service';
import { NotFoundException } from '@nestjs/common';

jest.mock('fs', () => ({
  mkdir: jest.fn(),
  writeFile: jest.fn(),
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
    it('should save the file and return the media asset', async () => {
      const mockFile = {
        originalname: 'test.txt',
        buffer: Buffer.from('data'),
        mimetype: 'text/plain',
        size: 1234,
      } as Express.Multer.File;

      const mockMediaAsset = {
        filename: 'test.txt',
        storedFilename: '123456789-test.txt',
        filepath: 'documents/123456789-test.txt',
        mimetype: 'text/plain',
        size: 1234,
        type: 'document',
        uploadedBy: 'current-user-id',
        metadata: {},
      };

      mockMediaAssetService.createMediaAsset.mockReturnValue(of(mockMediaAsset));
      (fs.writeFile as unknown as jest.Mock).mockImplementation((_path, _buffer, callback) =>
        callback(null),
      );

      const result = await lastValueFrom(service.saveFile(mockFile));
      expect(result).toEqual(mockMediaAsset);
      expect(fs.writeFile).toHaveBeenCalled();
    });

    it('should handle errors during file save and cleanup', async () => {
      const mockFile = {
        originalname: 'test.txt',
        buffer: Buffer.from('data'),
        mimetype: 'text/plain', // Ensure this matches a supported MIME type
        size: 1234,
      } as Express.Multer.File;

      const mockMediaAsset = {
        filename: 'test.txt',
        storedFilename: '123456789-test.txt',
        filepath: 'documents/123456789-test.txt',
        mimetype: 'text/plain',
        size: 1234,
        type: 'document',
        uploadedBy: 'current-user-id',
        metadata: {},
      };

      mockMediaAssetService.createMediaAsset.mockReturnValue(of(mockMediaAsset));
      (fs.writeFile as unknown as jest.Mock).mockImplementation((_path, _buffer, callback) =>
        callback(new Error('Error saving file')),
      );

      // Mock fs.existsSync to return true so that the cleanup logic is executed
      (fs.existsSync as jest.Mock).mockReturnValue(true);

      await expect(lastValueFrom(service.saveFile(mockFile))).rejects.toThrow('Error saving file');

      // Verify that the cleanup logic was executed
      expect(fs.promises.unlink).toHaveBeenCalled(); // Ensure the file was deleted
      expect(mockMediaAssetService.deleteMediaAsset).toHaveBeenCalledWith(
        mockMediaAsset.storedFilename,
      ); // Ensure the media asset was deleted
    });
  });

  describe('getFile', () => {
    it('should return file metadata', async () => {
      const filename = 'test.txt';
      const mimeType = 'text/plain';
      const directory = 'documents';
      const filePath = path.join(service['baseUploadDir'], directory, filename);

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
