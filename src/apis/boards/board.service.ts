import { User } from '@/common/entities/user.entity';
import { Board } from '../../common/entities/board.entity';
import { Workspace } from '../../common/entities/workspace.entity';
import { AppDataSource } from '../../config/data-source';
import { AddBoardMemberDto, CreateBoardDto, UpdateBoardDto } from './board.dto';
import { Role } from '@/common/entities/role.entity';
import { BoardMembers } from '@/common/entities/board-member.entity';
import { ROLES } from '@/common/constants/roles';
import { EmailService } from '../mail/mail.service';

import { BoardMembers } from '../../common/entities/board-member.entity';
import { Role } from '../../common/entities/role.entity';
import { ROLES } from '@/common/constants/roles';

import { BoardMembers } from '../../common/entities/board-member.entity';
import { Role } from '../../common/entities/role.entity';
import { ROLES } from '@/common/constants/roles';

export class BoardService {
  private boardRepository = AppDataSource.getRepository(Board);
  private workspaceRepository = AppDataSource.getRepository(Workspace);
  private boardMemberRepository = AppDataSource.getRepository(BoardMembers);
  private userRepository = AppDataSource.getRepository(User);
  private roleRepository = AppDataSource.getRepository(Role);
  private emailService = new EmailService();

  private boardMemberRepository = AppDataSource.getRepository(BoardMembers);
  private roleRepository = AppDataSource.getRepository(Role);

  private boardMemberRepository = AppDataSource.getRepository(BoardMembers);
  private roleRepository = AppDataSource.getRepository(Role);

  async createBoard(data: CreateBoardDto, creatorId?: string) {
    const workspace = await this.workspaceRepository.findOne({
      where: { id: data.workspaceId, isArchived: false },
    });

    if (!workspace) throw new Error('Workspace not found or archived');

    const board = this.boardRepository.create({
      title: data.title,
      description: data.description || null,
      coverUrl: data.coverUrl || null,
      visibility: data.visibility || 'private',
      isClosed: false,
      workspace,
    });

    const savedBoard = await this.boardRepository.save(board);
    if (creatorId) {
      const ownerRole = await this.roleRepository.findOne({
        where: { name: ROLES.BOARD_OWNER },
      });

      if (ownerRole) {
        const boardMember = this.boardMemberRepository.create({
          userId: creatorId,
          boardId: savedBoard.id,
          roleId: ownerRole.id,
        });

        await this.boardMemberRepository.save(boardMember);
      } else {
        throw new Error('Owner role not found');
      }
    }

    return savedBoard;
  }

  async getBoards(workspaceId: string) {
    return await this.boardRepository.find({
      where: {
        workspace: { id: workspaceId, isArchived: false },
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
      relations: ['workspace'],
      where: { id },
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

  async deleteBoardPermanently(id: string) {
    const board = await this.boardRepository.findOne({
      where: { id },
    });

    if (!board) throw new Error('Board not found');

    await this.boardRepository.remove(board);
    return { message: 'Board deleted permanently' };
  }

}
