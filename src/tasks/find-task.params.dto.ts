import { Transform } from 'class-transformer';
import {
  IsEnum,
  IsIn,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { TaskStatus } from './task.model';

export class FindTaskParams {
  @IsOptional()
  @IsEnum(TaskStatus)
  status?: TaskStatus;

  @IsOptional()
  @MinLength(3)
  @MaxLength(100)
  @IsString()
  search?: string;

  @IsOptional()
  // @IsString()
  @Transform(({ value }: { value?: string }) => {
    if (!value) return undefined;

    if (typeof value === 'string') {
      return value.split(',');
      // .map((label: string) => label.trim())
      // .filter((label: string) => label.length);
    }

    return value;
  })
  labels?: string[];

  @IsOptional()
  @IsIn(['createdAt', 'updatedAt', 'title', 'status'])
  sortBy?: 'createdAt' | 'updatedAt' | 'title' | 'status' = 'createdAt';

  @IsOptional()
  @IsEnum(['ASC', 'DESC'])
  sortOrder?: 'ASC' | 'DESC' = 'DESC';
}
