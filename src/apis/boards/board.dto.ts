import { IsEmail, IsNotEmpty, IsUUID } from 'class-validator';

export class CreateBoardDto {
  title: string;
  description?: string;
  coverUrl?: string;
  workspaceId: string; // UUID
  visibility?: 'private' | 'public' | 'workspace';
}

export class UpdateBoardDto {
  title?: string;
  description?: string;
  coverUrl?: string;
  isClosed?: boolean;
  visibility?: 'private' | 'public' | 'workspace';
}

export class AddBoardMemberDto {
  @IsEmail({}, { message: 'Invalid email address' })
  @IsNotEmpty({ message: 'Email is required' })
  public email: string;

  @IsUUID('4', { message: 'Invalid roleId' })
  @IsNotEmpty({ message: 'Role ID is required' })
  public roleId: string;
}
