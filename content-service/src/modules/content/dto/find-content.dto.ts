import { IsMongoId } from 'class-validator';

export class FindContentDto {
  @IsMongoId()
  id: string;
}
