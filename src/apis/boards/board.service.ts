import { Board } from '../../common/entities/board.entity';
import { Workspace } from '../../common/entities/workspace.entity';
import { AppDataSource } from '../../config/data-source';
import { CreateBoardDto, UpdateBoardDto } from './board.dto';

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
      coverUrl: data.coverUrl || null,
      workspace,
      isActive: true,
      isDeleted: false,
    });

    return await this.boardRepository.save(board);
  }

  async getBoards(workspaceId: number) {
    return await this.boardRepository.find({
      where: {
        workspace: { id: workspaceId },
        isDeleted: false,
      },
      relations: ['workspace'],
    });
  }

  async getBoardById(id: number) {
    const board = await this.boardRepository.findOne({
      where: { id, isDeleted: false },
      relations: ['workspace', 'lists'],
    });
    if (!board) throw new Error('Board not found');
    return board;
  }

  async updateBoard(id: number, data: UpdateBoardDto) {
    const board = await this.getBoardById(id);
    Object.assign(board, data);

    return await this.boardRepository.save(board);
  }

  async deleteBoard(id: number) {
    const board = await this.getBoardById(id);
    board.isDeleted = true;
    return await this.boardRepository.save(board);
  }
}
