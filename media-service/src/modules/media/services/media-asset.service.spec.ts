import { Test, TestingModule } from '@nestjs/testing';
import { MediaAssetService } from './media-asset.service';
import { getFileType } from '../../../utils/helpers/getFileType';
import { getDirectoryForType } from '../../../utils/helpers/getDirectoryForType';
import { getModelToken } from '@nestjs/mongoose';
import { MediaAsset } from '../schemas/media-asset';

jest.mock('../../../utils/helpers/getFileType');
jest.mock('../../../utils/helpers/getDirectoryForType');

describe('MediaAssetService', () => {
  let service: MediaAssetService;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let mockMediaAssetModel: any;

  const mockMediaAsset = {
    filename: 'test.txt',
    mimetype: 'text/plain',
    filepath: 'documents/123456789-test.txt',
    storedFilename: '123456789-test.txt',
    size: 1234,
    type: 'document',
    uploadedBy: 'user-123',
    metadata: { width: 100, height: 100 },
  };

  beforeEach(async () => {
    // Create a mock constructor function that simulates "new Model(data)"
    const mockMediaAssetModelConstructor = jest.fn().mockImplementation((data) => {
      return {
        ...data,
        save: jest.fn().mockResolvedValue(data),
      };
    });

    // Attach static methods to the constructor
    mockMediaAssetModel = Object.assign(mockMediaAssetModelConstructor, {
      findById: jest.fn(),
      find: jest.fn(),
      findByIdAndDelete: jest.fn(),
    });

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MediaAssetService,
        {
          provide: getModelToken(MediaAsset.name),
          useValue: mockMediaAssetModel,
        },
      ],
    }).compile();

    service = module.get<MediaAssetService>(MediaAssetService);
  });

  describe('createMediaAsset', () => {
    it('should create and save a media asset successfully', async () => {
      // Arrange
      const file = {
        originalname: 'test.txt',
        mimetype: 'text/plain',
        size: 1234,
        buffer: Buffer.from('dummy content'),
      } as Express.Multer.File;

      const storedFilename = '123456789-test.txt';
      const userId = 'user-123';

      // Mock the external helper functions
      (getFileType as jest.Mock).mockReturnValue('document');
      (getDirectoryForType as jest.Mock).mockReturnValue('documents');

      // Act
      const result = await service.createMediaAsset({ file, storedFilename, userId });

      // Assert
      expect(getFileType).toHaveBeenCalledWith(file.mimetype);
      expect(getDirectoryForType).toHaveBeenCalledWith('document');

      // The service calls "new this.mediaAssetModel(...)" with the following data:
      expect(mockMediaAssetModel).toHaveBeenCalledWith({
        filename: file.originalname,
        mimetype: file.mimetype,
        filepath: `documents/${storedFilename}`,
        storedFilename,
        size: file.size,
        type: 'document',
        uploadedBy: userId,
        metadata: { width: 100, height: 100 },
      });
      expect(result).toEqual({
        filename: file.originalname,
        mimetype: file.mimetype,
        filepath: `documents/${storedFilename}`,
        storedFilename,
        size: file.size,
        type: 'document',
        uploadedBy: userId,
        metadata: { width: 100, height: 100 },
      });
    });

    it('should throw an error if file type is not supported', async () => {
      // Arrange
      const file = {
        originalname: 'test.txt',
        mimetype: 'unsupported/type',
        size: 1234,
        buffer: Buffer.from('dummy content'),
      } as Express.Multer.File;
      const storedFilename = 'any-filename';
      const userId = 'user-123';

      (getFileType as jest.Mock).mockReturnValue(undefined);

      // Act & Assert
      await expect(service.createMediaAsset({ file, storedFilename, userId })).rejects.toThrow(
        `Unsupported file type: ${file.mimetype}`,
      );
    });
  });

  describe('findById', () => {
    it('should return a media asset by id', async () => {
      const id = '123';
      // Arrange: simulate the Mongoose query
      mockMediaAssetModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockMediaAsset),
      });

      // Act
      const result = await service.findById(id);

      // Assert
      expect(mockMediaAssetModel.findById).toHaveBeenCalledWith(id);
      expect(result).toEqual(mockMediaAsset);
    });
  });

  describe('findByType', () => {
    it('should return media assets of a given type', async () => {
      const type = 'document';
      mockMediaAssetModel.find.mockReturnValue({
        exec: jest.fn().mockResolvedValue([mockMediaAsset]),
      });

      const result = await service.findByType(type);
      expect(mockMediaAssetModel.find).toHaveBeenCalledWith({ type });
      expect(result).toEqual([mockMediaAsset]);
    });
  });

  describe('findByCollection', () => {
    it('should return media assets by collection', async () => {
      const collection = 'some-collection';
      mockMediaAssetModel.find.mockReturnValue({
        exec: jest.fn().mockResolvedValue([mockMediaAsset]),
      });

      const result = await service.findByCollection(collection);
      expect(mockMediaAssetModel.find).toHaveBeenCalledWith({ collection });
      expect(result).toEqual([mockMediaAsset]);
    });
  });

  describe('deleteMediaAsset', () => {
    it('should delete and return the media asset', async () => {
      const id = '123';
      mockMediaAssetModel.findByIdAndDelete.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockMediaAsset),
      });

      const result = await service.deleteMediaAsset(id);
      expect(mockMediaAssetModel.findByIdAndDelete).toHaveBeenCalledWith(id);
      expect(result).toEqual(mockMediaAsset);
    });
  });
});
