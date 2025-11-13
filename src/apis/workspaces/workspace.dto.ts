import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class createWorkspaceDto {
  @IsString({ message: 'Title is required' })
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(['private', 'public'], {
    message: 'Visibility must be private or public',
  })
  @IsOptional()
  visibility?: 'private' | 'public';
}

export interface UpdateWorkspaceDto {
  title?: string;
  description?: string;
  visibility?: 'private' | 'public';
  isArchived?: boolean;
}
