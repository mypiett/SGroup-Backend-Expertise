import { Board } from '../../common/entities/board.entity';
import { Workspace } from '../../common/entities/workspace.entity';
import { AppDataSource } from '../../config/data-source';
import { CreateBoardDto } from './board.dto';

export class BoardService {
  private boardRepository = AppDataSource.getRepository(Board);
  private workspaceRepository = AppDataSource.getRepository(Workspace);

  async createBoard(data: CreateBoardDto) {
    const workspace = await this.workspaceRepository.findOne({
      where: { id: data.workspaceId, isDeleted: false },
    });
    if (!workspace) throw new Error('Workspace not found');

    const board = this.boardRepository.create({
      name: data.name,
      description: data.description || '',
      coverUrl: data.coverUrl || '',
      workspace,
      isActive: true,
      isDeleted: false,
    });

    return await this.boardRepository.save(board);
  }
}
