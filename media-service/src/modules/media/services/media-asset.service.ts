import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { MediaAsset, MediaAssetDocument } from '../schemas/media-asset';

@Injectable()
export class MediaAssetService {
  constructor(
    @InjectModel(MediaAsset.name)
    private mediaAssetModel: Model<MediaAssetDocument>,
  ) {}

  async createMediaAsset(mediaAssetData: Partial<MediaAsset>): Promise<MediaAsset> {
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
