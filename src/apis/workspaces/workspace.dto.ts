import { IsNotEmpty, IsString } from 'class-validator';

export class createWorkspaceDto {
  @IsString({ message: 'Name is required' })
  @IsNotEmpty()
  name: string;

  @IsString()
  description?: string;
}

export interface UpdateWorkspaceDto {
  name?: string;
  description?: string;
  isActive?: boolean;
}
