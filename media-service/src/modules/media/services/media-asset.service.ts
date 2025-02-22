import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { MediaAsset, MediaAssetDocument } from '../schemas/media-asset';
import { getFileType } from '../../../utils/helpers/getFileType';
import { getDirectoryForType } from '../../../utils/helpers/getDirectoryForType';

// ========================== TODO: ADD ASSET REFERENCES ENDPOINTS ==========================

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

  // For More Information: https://chatgpt.com/share/67b08878-f604-800a-8c0e-dc7d68c0fccd | danylenko.1407

  // Method for incrementing usageCount
  async incrementUsageCount(id: Types.ObjectId): Promise<MediaAsset | null> {
    this.logger.verbose(`Incrementing usage count for media asset: ${id}`);

    return this.mediaAssetModel
      .findByIdAndUpdate(id, { $inc: { usageCount: 1 } }, { new: true })
      .exec();
  }

  // Method for adding reference
  async addReference(id: string, referenceId: string): Promise<MediaAsset | null> {
    return this.mediaAssetModel
      .findByIdAndUpdate(id, { $addToSet: { references: referenceId } }, { new: true })
      .exec();
  }

  // Method for removing reference
  async removeReference(id: string, referenceId: string): Promise<MediaAsset | null> {
    return this.mediaAssetModel
      .findByIdAndUpdate(id, { $pull: { references: referenceId } }, { new: true })
      .exec();
  }

  async findOneByStoredFilename(storedFilename: string): Promise<MediaAsset | null> {
    return this.mediaAssetModel.findOne({ storedFilename }).exec();
  }
}
