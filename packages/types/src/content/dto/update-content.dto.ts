import { IsOptional } from 'class-validator';
import { PartialType } from '@nestjs/swagger';
import { BaseContentDto } from './base.dto';

export class UpdateContentDto extends PartialType(BaseContentDto) {
  @IsOptional()
  override title?: string;

  @IsOptional()
  override body?: string;

  @IsOptional()
  override type?: string;

  @IsOptional()
  override author?: string;
}
