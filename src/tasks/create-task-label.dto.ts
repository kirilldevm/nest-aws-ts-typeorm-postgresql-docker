import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

export class CreateTaskLabelDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(100)
  name: string;
}
