import { Test, TestingModule } from '@nestjs/testing';
import { MediaController } from './media.controller';
import { StorageService } from '../services/storage.service';
import { MediaAssetService } from '../services/media-asset.service';
import { lastValueFrom, of } from 'rxjs';

describe('MediaController', () => {
  let controller: MediaController;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let storageService: StorageService;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let mediaAssetService: MediaAssetService;

  const mockStorageService = {
    saveFile: jest.fn(),
    getFile: jest.fn(),
  };

  const mockMediaAssetService = {
    createMediaAsset: jest.fn(),
    deleteMediaAsset: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MediaController],
      providers: [
        { provide: StorageService, useValue: mockStorageService },
        { provide: MediaAssetService, useValue: mockMediaAssetService },
      ],
    }).compile();

    controller = module.get<MediaController>(MediaController);
    storageService = module.get<StorageService>(StorageService);
    mediaAssetService = module.get<MediaAssetService>(MediaAssetService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('uploadFile', () => {
    it('should save the file and return the media asset', async () => {
      // Fix Date.now() so the storedFilename is predictable
      jest.spyOn(Date, 'now').mockReturnValue(123456789);

      const mockFile = {
        originalname: 'test.txt',
        buffer: Buffer.from('data'),
      } as Express.Multer.File;

      const expectedStoredFilename = '123456789-test.txt';
      const expectedMediaAsset = { filename: 'test.txt', storedFilename: expectedStoredFilename };

      // Set up mocks:
      // The media asset is created by mediaAssetService
      mockMediaAssetService.createMediaAsset.mockReturnValue(of(expectedMediaAsset));
      // The storageService.saveFile call returns an Observable that completes successfully (its value is not used)
      mockStorageService.saveFile.mockReturnValue(of(undefined));

      const result = await lastValueFrom(
        controller.uploadFile({ file: mockFile, userId: 'test-user-id' }),
      );

      // Verify that storageService.saveFile was called with the correct parameters.
      expect(mockStorageService.saveFile).toHaveBeenCalledWith({
        file: mockFile,
        storedFilename: expectedStoredFilename,
      });

      // Verify that mediaAssetService.createMediaAsset was called with the correct parameters.
      expect(mockMediaAssetService.createMediaAsset).toHaveBeenCalledWith({
        file: mockFile,
        storedFilename: expectedStoredFilename,
        userId: 'test-user-id',
      });

      // The controller maps the forkJoin result and returns the media asset.
      expect(result).toEqual(expectedMediaAsset);
    });
  });

  describe('getFile', () => {
    it('should return file metadata', async () => {
      const filename = 'test.txt';
      const fileMetadata = { filePath: '/path/to/test.txt', mimeType: 'text/plain' };
      mockStorageService.getFile.mockReturnValue(of(fileMetadata));

      const result = await lastValueFrom(controller.getFile(filename));
      expect(mockStorageService.getFile).toHaveBeenCalledWith(filename);
      expect(result).toEqual(fileMetadata);
    });
  });
});
