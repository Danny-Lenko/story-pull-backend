import { IsString, IsInt, MinLength, Min } from 'class-validator';

export class CreateUserDto {
  @IsString()
  @MinLength(3)
  name: string;

  @IsInt()
  @Min(18)
  age: number;
}
