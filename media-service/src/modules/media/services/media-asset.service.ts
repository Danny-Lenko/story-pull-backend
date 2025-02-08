import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { MediaAsset, MediaAssetDocument } from '../schemas/media-asset';
import { getFileType } from '../../../utils/helpers/getFileType';
import { getDirectoryForType } from '../../../utils/helpers/getDirectoryForType';

@Injectable()
export class MediaAssetService {
  private readonly logger = new Logger(MediaAssetService.name);

  constructor(
    @InjectModel(MediaAsset.name)
    private mediaAssetModel: Model<MediaAssetDocument>,
  ) {}

  async createMediaAsset({
    file,
    storedFilename,
    userId,
  }: {
    file: Express.Multer.File;
    storedFilename: string;
    userId: string;
  }): Promise<MediaAsset> {
    const fileType = getFileType(file.mimetype);

    if (!fileType) {
      throw new Error(`Unsupported file type: ${file.mimetype}`);
    }

    const directory = getDirectoryForType(fileType);

    const mediaAssetData = {
      filename: file.originalname,
      mimetype: file.mimetype,
      filepath: `${directory}/${storedFilename}`,
      storedFilename,
      size: file.size,
      type: fileType,
      uploadedBy: userId,
      // metadata: this.extractMetadata(file),
      metadata: { width: 100, height: 100 }, // mock metadata
    };

    const createdMediaAsset = new this.mediaAssetModel(mediaAssetData);
    return createdMediaAsset.save();
  }

  async findById(id: string): Promise<MediaAsset | null> {
    return this.mediaAssetModel.findById(id).exec();
  }

  async findByType(type: string): Promise<MediaAsset[]> {
    return this.mediaAssetModel.find({ type }).exec();
  }

  async findByCollection(collection: string): Promise<MediaAsset[]> {
    return this.mediaAssetModel.find({ collection }).exec();
  }

  async deleteMediaAsset(id: string): Promise<MediaAsset | null> {
    return this.mediaAssetModel.findByIdAndDelete(id).exec();
  }
}
