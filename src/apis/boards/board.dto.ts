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
