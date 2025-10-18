export class CreateBoardDto {
  name: string;
  description?: string;
  coverUrl?: string;
  workspaceId: number;
}
