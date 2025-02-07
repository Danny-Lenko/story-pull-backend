// import path from 'path';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { MediaAsset, MediaAssetDocument } from '../schemas/media-asset';
import { getFileType } from '../../../utils/helpers/getFileType';
import { getDirectoryForType } from '../../../utils/helpers/getDirectoryForType';

@Injectable()
export class MediaAssetService {
  // private readonly baseUploadDir: string;

  constructor(
    @InjectModel(MediaAsset.name)
    private mediaAssetModel: Model<MediaAssetDocument>,
    // private logger: Logger,
    // private configService: ConfigService,
  ) {
    // this.baseUploadDir = this.configService.get<string>('UPLOAD_DIR') || '../shared/uploads';
  }

  // async createMediaAsset(mediaAssetData: Partial<MediaAsset>): Promise<MediaAsset> {
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

    // this.logger.log(`USER: ${userId} is uploading file: ${file.originalname}`);

    if (!fileType) {
      throw new Error(`Unsupported file type: ${file.mimetype}`);
    }

    const directory = getDirectoryForType(fileType);
    // const subDirectory = path.join(this.baseUploadDir, directory);
    // const filePath = path.join(subDirectory, storedFilename);

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

  // private getFileType(mimetype: string): string | null {
  //   for (const [type, config] of Object.entries(MEDIA_TYPES)) {
  //     if (config.mimePattern.test(mimetype)) {
  //       return type;
  //     }
  //   }
  //   return null;
  // }

  // private getDirectoryForType(type: string): string {
  //   return MEDIA_TYPES[type]?.directory || '';
  // }
}
