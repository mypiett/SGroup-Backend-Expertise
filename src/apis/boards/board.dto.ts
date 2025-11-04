export class CreateBoardDto {
  name: string;
  description?: string;
  coverUrl?: string;
  workspaceId: number;
}

export class UpdateBoardDto {
  name?: string;
  description?: string;
  coverUrl?: string;
  isActive?: boolean;
}
