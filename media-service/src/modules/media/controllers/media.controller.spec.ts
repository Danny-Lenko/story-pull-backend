import { Test, TestingModule } from '@nestjs/testing';
import { MediaController } from './media.controller';
import { StorageService } from '../services/storage.service';
import { lastValueFrom, of } from 'rxjs';

describe('MediaController', () => {
  let controller: MediaController;
  let storageService: StorageService;

  const mockStorageService = {
    saveFile: jest.fn(),
    getFile: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MediaController],
      providers: [{ provide: StorageService, useValue: mockStorageService }],
    }).compile();

    controller = module.get<MediaController>(MediaController);
    storageService = module.get<StorageService>(StorageService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('uploadFile', () => {
    it('should save the file and return the filename', async () => {
      const mockFile = {
        originalname: 'test.txt',
        buffer: Buffer.from('data'),
      } as Express.Multer.File;
      mockStorageService.saveFile.mockReturnValue(of('test.txt'));

      const result = await lastValueFrom(controller.uploadFile({ file: mockFile }));
      expect(storageService.saveFile).toHaveBeenCalledWith(mockFile);
      expect(result).toEqual({ filename: 'test.txt' });
    });
  });

  describe('getFile', () => {
    it('should return file metadata', async () => {
      const filename = 'test.txt';
      const fileMetadata = { filePath: '/path/to/test.txt', mimeType: 'text/plain' };
      mockStorageService.getFile.mockReturnValue(of(fileMetadata));

      const result = await lastValueFrom(controller.getFile(filename));
      expect(storageService.getFile).toHaveBeenCalledWith(filename);
      expect(result).toEqual(fileMetadata);
    });
  });
});
