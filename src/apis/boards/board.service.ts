import { Board } from '../../common/entities/board.entity';
import { Workspace } from '../../common/entities/workspace.entity';
import { AppDataSource } from '../../config/data-source';
import { CreateBoardDto, UpdateBoardDto } from './board.dto';

export class BoardService {
  private boardRepository = AppDataSource.getRepository(Board);
  private workspaceRepository = AppDataSource.getRepository(Workspace);

  async createBoard(data: CreateBoardDto) {
    const workspace = await this.workspaceRepository.findOne({
      where: { id: data.workspaceId },
    });

    if (!workspace) throw new Error('Workspace not found');

    const board = this.boardRepository.create({
      title: data.title,
      description: data.description || null,
      coverUrl: data.coverUrl || null,
      visibility: data.visibility || 'private',
      isClosed: false,
      workspace,
    });

    return await this.boardRepository.save(board);
  }

  async getBoards(workspaceId: string) {
    return await this.boardRepository.find({
      where: {
        workspace: { id: workspaceId },
        isClosed: false,
      },
      relations: ['workspace'],
      select: {
        id: true,
        title: true,
        description: true,
        coverUrl: true,
        visibility: true,
        isClosed: true,
        createdAt: true,
        updatedAt: true,
        workspace: {
          id: true,
          title: true,
        },
      },
    });
  }

  async getBoardById(id: string) {
    const board = await this.boardRepository.findOne({
      where: { id },
      relations: ['workspace', 'lists', 'boardMembers'],
      select: {
        id: true,
        title: true,
        description: true,
        coverUrl: true,
        visibility: true,
        isClosed: true,
        createdAt: true,
        updatedAt: true,
        workspace: {
          id: true,
          title: true,
        },
      },
    });

    if (!board) throw new Error('Board not found');
    return board;
  }

  async updateBoard(id: string, data: UpdateBoardDto) {
    const board = await this.boardRepository.findOne({
      where: { id },
    });

    if (!board) throw new Error('Board not found');

    Object.assign(board, data);

    return await this.boardRepository.save(board);
  }

  async deleteBoard(id: string) {
    const board = await this.boardRepository.findOne({
      where: { id },
    });

    if (!board) throw new Error('Board not found');

    board.isClosed = true;

    return await this.boardRepository.save(board);
  }

  async restoreBoard(id: string) {
    const board = await this.boardRepository.findOne({
      where: { id },
    });

    if (!board) throw new Error('Board not found');

    board.isClosed = false;

    return await this.boardRepository.save(board);
  }
}
