import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

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

export class AddMemberDto {
  @IsUUID('4', { message: 'User ID must be a valid UUID' })
  @IsNotEmpty({ message: 'User ID is required' })
  userId: string;

  @IsUUID('4', { message: 'Role ID must be a valid UUID' })
  @IsNotEmpty({ message: 'Role ID is required' })
  roleId: string;
}

export class UpdateMemberRoleDto {
  @IsUUID('4', { message: 'Role ID must be a valid UUID' })
  @IsNotEmpty({ message: 'Role ID is required' })
  roleName: string;
}

export class InviteMemberDto {
  @IsString({ message: 'Email is required' })
  @IsNotEmpty({ message: 'Email is required' })
  email: string;

  @IsString({ message: 'Role name is required' })
  @IsNotEmpty({ message: 'Role name is required' })
  roleName: string;
}

export class UpdateVisibilityDto {
  @IsEnum(['private', 'public'], {
    message: 'Visibility must be private or public',
  })
  @IsNotEmpty({ message: 'Visibility is required' })
  visibility: 'private' | 'public';
}
