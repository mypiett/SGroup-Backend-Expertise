import { User } from '@/common/entities/user.entity';
import { Board } from '../../common/entities/board.entity';
import { Workspace } from '../../common/entities/workspace.entity';
import { AppDataSource } from '../../config/data-source';
import { CreateBoardDto, UpdateBoardDto } from './board.dto';
import { Role } from '@/common/entities/role.entity';
import { BoardMembers } from '@/common/entities/board-member.entity';
import { ROLES } from '@/common/constants/roles';
import { EmailService } from '../mail/mail.service';
import { rbacProvider } from '@/common/utils/rbac';
import crypto from 'crypto';
import { AddBoardMemberInput } from './board.schema';

export class BoardService {
  private boardRepository = AppDataSource.getRepository(Board);
  private workspaceRepository = AppDataSource.getRepository(Workspace);
  private boardMemberRepository = AppDataSource.getRepository(BoardMembers);
  private userRepository = AppDataSource.getRepository(User);
  private roleRepository = AppDataSource.getRepository(Role);
  private emailService = new EmailService();

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

        // Invalidate RBAC cache for the board creator
        await rbacProvider.clearCache(creatorId, savedBoard.id);
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
        commentPolicy: true,
        memberManagePolicy: true,
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

  async addMemberToBoard(
    boardId: string,
    data: AddBoardMemberInput,
    currentUserId: string
  ) {
    const user = await this.userRepository.findOne({
      where: { email: data.email },
    });

    if (!user) throw new Error('User not found');
    const [board, currentMember, existingMember, role] = await Promise.all([
      this.boardRepository.findOne({ where: { id: boardId } }),
      this.boardMemberRepository.findOne({
        where: { boardId, userId: currentUserId },
        relations: ['role', 'user'],
      }),
      this.boardMemberRepository.findOne({
        where: { boardId, userId: user?.id },
      }),
      this.roleRepository.findOne({ where: { id: data.roleId } }),
    ]);

    if (!board) throw new Error('Board not found');
    if (!currentMember) throw new Error('You are not a member of this board');

    const currentRoleName = currentMember.role.name as string;

    if (!this.canCurrentUserManageMembers(board, currentRoleName)) {
      if (board.memberManagePolicy === 'admins_only') {
        throw new Error(
          'Only board owner or admin can manage members when memberManagePolicy=admins_only'
        );
      }
      throw new Error(
        'Only board owner, admin or member can manage members when memberManagePolicy=all_members'
      );
    }


    if (existingMember)
      throw new Error('User is already a member of this board');
    if (!role) throw new Error('Role not found');

    const boardRoles = [
      ROLES.BOARD_OWNER,
      ROLES.BOARD_ADMIN,
      ROLES.BOARD_MEMBER,
      ROLES.BOARD_OBSERVER,
    ];
    if (!boardRoles.includes(role.name as any)) {
      throw new Error('Invalid role for board member');
    }

    const newMember = this.boardMemberRepository.create({
      boardId,
      userId: user.id,
      roleId: role.id,
    });

    await this.boardMemberRepository.save(newMember);

    // Invalidate RBAC cache for the new board member
    await rbacProvider.clearCache(user.id, boardId);

    const savedMember = await this.boardMemberRepository.findOne({
      where: { id: newMember.id },
      relations: ['user', 'role', 'board'],
    });
    if (savedMember?.user) {
      delete savedMember.user.password;
    }

    await this.emailService.sendBoardInvitationEmail({
      to: user.email,
      boardTitle: board.title,
      inviterName: currentMember.user.name,
      roleName: role.name,
      link: `${process.env.BACKEND_URL}/boards/${board.id}`,
    });

    return {
      message: 'Member added to board successfully',
      member: savedMember,
    };
  }

  async createLinkShareBoard(boardId: string, currentUserId: string) {
    const [board, currentMember] = await Promise.all([
      this.boardRepository.findOne({ where: { id: boardId } }),
      this.boardMemberRepository.findOne({
        where: { boardId, userId: currentUserId },
        relations: ['role', 'user'],
      }),
    ]);
    if (!board) throw new Error('Board not found');
    if (!currentMember) throw new Error('You are not a member of this board');
    if (currentMember.role.name == ROLES.BOARD_OBSERVER)
      throw new Error(`You don't have permission to create link`);
    const inviteToken = crypto.randomBytes(16).toString('hex');
    await this.boardRepository.update(
      { id: boardId },
      {
        inviteToken: inviteToken,
      }
    );
    const linkInvite = `${process.env.BACKEND_URL}/boards/${boardId}/invite/${inviteToken}`;
    return {
      message: 'Invite link created successfully',
      link: linkInvite,
    };
  }

  async deleteLinkShareBoard(boardId: string, currentUserId: string) {
    const [board, currentMember] = await Promise.all([
      this.boardRepository.findOne({ where: { id: boardId } }),
      this.boardMemberRepository.findOne({
        where: { boardId, userId: currentUserId },
        relations: ['role', 'user'],
      }),
    ]);
    if (!board) throw new Error('Board not found');
    if (!currentMember) throw new Error('You are not a member of this board');
    if (currentMember.role.name == ROLES.BOARD_OBSERVER)
      throw new Error(`You don't have permission to delete link`);
    if (!board.inviteToken)
      throw new Error('Board does not have an invite link');
    await this.boardRepository.update({ id: boardId }, { inviteToken: null });
    return {
      message: 'Invite link deleted successfully',
    };
  }

  async JoinBoardByLink(
    boardId: string,
    currentUserId: string,
    inviteToken: string
  ) {
    const [board, currentMember] = await Promise.all([
      this.boardRepository.findOne({ where: { id: boardId } }),
      this.boardMemberRepository.findOne({
        where: { boardId, userId: currentUserId },
        relations: ['role', 'user'],
      }),
    ]);
    if (!board) throw new Error('Board not found');
    if (currentMember)
      throw new Error('You are already a member of this board');
    if (!board.inviteToken) {
      throw new Error('This board does not support invite by link');
    }
    if (board.inviteToken !== inviteToken)
      throw new Error('Invalid or expired invation link');
    const memberRole = await this.roleRepository.findOne({
      where: { name: ROLES.BOARD_MEMBER },
    });
    if (!memberRole) {
      throw new Error('Default board member role not found');
    }
    const newMember = this.boardMemberRepository.create({
      boardId,
      userId: currentUserId,
      roleId: memberRole.id,
    });
    await this.boardMemberRepository.save(newMember);

    // Invalidate RBAC cache for the new board member
    await rbacProvider.clearCache(currentUserId, boardId);

    const savedMember = await this.boardMemberRepository.findOne({
      where: { id: newMember.id },
      relations: ['user', 'role', 'board'],
    });
    if (savedMember?.user) {
      delete savedMember.user.password;
    }

    return {
      message: 'You joined this board successfully',
      member: savedMember,
    };
  }

  private canCurrentUserManageMembers(board: Board, roleName: string): boolean {
    if (board.memberManagePolicy === 'admins_only') {
      return (
        roleName === ROLES.BOARD_OWNER ||
        roleName === ROLES.BOARD_ADMIN
      );
    }

    if (board.memberManagePolicy === 'all_members') {
      return (
        roleName === ROLES.BOARD_OWNER ||
        roleName === ROLES.BOARD_ADMIN ||
        roleName === ROLES.BOARD_MEMBER
      );
    }
    return (
      roleName === ROLES.BOARD_OWNER ||
      roleName === ROLES.BOARD_ADMIN
    );
  }


  async getBoardOwner(boardId: string) {
    const ownerRole = await this.roleRepository.findOne({
      where: { name: ROLES.BOARD_OWNER },
    });
    if (!ownerRole) throw new Error('Owner role not found');

    const boardMember = await this.boardMemberRepository.findOne({
      where: { boardId, roleId: ownerRole.id },
    });
    if (!boardMember) throw new Error('Board owner not found');
    return boardMember;
  }

  async transferOwnership(boardId: string, newOwnerId: string) {
    const [ownerRole, adminRole, memberRole] = await Promise.all([
      this.roleRepository.findOne({
        where: { name: ROLES.BOARD_OWNER },
      }),
      this.roleRepository.findOne({
        where: { name: ROLES.BOARD_ADMIN },
      }),
      this.roleRepository.findOne({
        where: { name: ROLES.BOARD_MEMBER },
      }),
    ]);

    if (!ownerRole) throw new Error('Owner role not found');
    const currentOwner = await this.boardMemberRepository.findOne({
      where: { boardId, roleId: ownerRole.id },
    });
    if (!currentOwner) throw new Error('Board owner not found');    
    if (currentOwner.userId === newOwnerId) {
      return this.boardRepository.findOne({
        where: { id: boardId },
        relations: ['boardMembers'],
      });
    }

    const demotionRoleId = adminRole?.id ?? memberRole?.id;
    if (!demotionRoleId) {
      throw new Error('No role available to demote current owner');
    }
    const existingNewOwner = await this.boardMemberRepository.findOne({
      where: { boardId, userId: newOwnerId },
    });
    if (existingNewOwner) {
      existingNewOwner.roleId = ownerRole.id;
      await this.boardMemberRepository.save(existingNewOwner);

      currentOwner.roleId = demotionRoleId;
      await this.boardMemberRepository.save(currentOwner);
    } else {
      const previousOwnerId = currentOwner.userId;
      currentOwner.userId = newOwnerId;
      await this.boardMemberRepository.save(currentOwner);

      const demotedMember = this.boardMemberRepository.create({
        boardId,
        userId: previousOwnerId,
        roleId: demotionRoleId,
      });
      await this.boardMemberRepository.save(demotedMember);
    }
    return await this.boardRepository.findOne({
      where: { id: boardId },
      relations: ['boardMembers'],
    });
  }

  async checkBoardAdmin(boardId: string, userId: string) {
    const boardMember = await this.boardMemberRepository.findOne({
      where: { boardId, userId },
      relations: ['role'],
    });

    if (!boardMember) return false;
    const adminRoles = [ROLES.BOARD_OWNER, ROLES.BOARD_ADMIN];
    return adminRoles.includes(boardMember.role.name as any);
  }

  async updateBoardSettings(
    boardId: string,
    settings: {
      visibility?: 'private' | 'workspace' | 'public';
      coverUrl?: string;
      memberManagePolicy?: 'admins_only' | 'all_members';
      commentPolicy?: 'disabled' | 'members' | 'workspace' | 'anyone';
      workspaceMembersCanEditAndJoin?: boolean;
    }
  ): Promise<{ board: Board; changedFields: string[] }> {
    const board = await this.boardRepository.findOne({ where: { id: boardId } });
    if (!board) throw new Error('Board not found');

    const changedFields: string[] = [];

    if (settings.visibility !== undefined && settings.visibility !== board.visibility) {
      board.visibility = settings.visibility;
      changedFields.push('visibility');
    }

    if (settings.coverUrl !== undefined && settings.coverUrl !== board.coverUrl) {
      board.coverUrl = settings.coverUrl;
      changedFields.push('coverUrl');
    }

    if (
      settings.memberManagePolicy !== undefined &&
      settings.memberManagePolicy !== board.memberManagePolicy
    ) {
      board.memberManagePolicy = settings.memberManagePolicy;
      changedFields.push('memberManagePolicy');
    }

    if (
      settings.commentPolicy !== undefined &&
      settings.commentPolicy !== board.commentPolicy
    ) {
      board.commentPolicy = settings.commentPolicy;
      changedFields.push('commentPolicy');
    }

    if (
      settings.workspaceMembersCanEditAndJoin !== undefined &&
      settings.workspaceMembersCanEditAndJoin !== board.workspaceMembersCanEditAndJoin
    ) {
      board.workspaceMembersCanEditAndJoin = settings.workspaceMembersCanEditAndJoin;
      changedFields.push('workspaceMembersCanEditAndJoin');
    }

    if (changedFields.length === 0) {
      return { board, changedFields };
    }

    const saved = await this.boardRepository.save(board);
    return { board: saved, changedFields };
  }


  async closeBoard(id: string) {
    const board = await this.boardRepository.findOne({
      where: { id },
    });
    if (!board) throw new Error('Board not found');
    board.isClosed = true;
    return await this.boardRepository.save(board);
  }

  async reopenBoard(id: string) {
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

  async updateBoardCover(boardId: string, coverUrl: string) {
    const board = await this.boardRepository.findOne({ where: { id: boardId } });
    if (!board) throw new Error('Board not found');
    board.coverUrl = coverUrl;
    return await this.boardRepository.save(board);
  }

  async getBoardMembers(boardId: string) {
    const board = await this.boardRepository.findOne({
      where: { id: boardId },
    });

    if (!board) throw new Error('Board not found');

    const boardMembers = await this.boardMemberRepository.find({
      where: { boardId },
      relations: ['user', 'role'],
    });

    return boardMembers.map((member) => ({
      id: member.user.id,
      name: member.user.name,
      email: member.user.email,
      roleName: member.role.name,
    }));
  }

  async removeMemberFromBoard(
    boardId: string,
    userIdToRemove: string,
    currentUserId: string
  ) {
    const board = await this.boardRepository.findOne({ where: { id: boardId } });
    if (!board) throw new Error('Board not found');

    const currentMember = await this.boardMemberRepository.findOne({
      where: { boardId, userId: currentUserId },
      relations: ['role'],
    });

    if (!currentMember) throw new Error('You are not a member of this board');

    const currentRoleName = currentMember.role.name as string;

    if (!this.canCurrentUserManageMembers(board, currentRoleName)) {
      if (board.memberManagePolicy === 'admins_only') {
        throw new Error(
          'Only board owner or admin can manage members when memberManagePolicy=admins_only'
        );
      }

      throw new Error(
        'Only board owner, admin or member can manage members when memberManagePolicy=all_members'
      );
    }

    const targetMember = await this.boardMemberRepository.findOne({
      where: { boardId, userId: userIdToRemove },
      relations: ['role'],
    });

    if (!targetMember) throw new Error('Member not found in this board');

    // Không cho đá owner (trừ khi chính owner tự rời board, tuỳ bạn muốn)
    if (
      targetMember.role.name === ROLES.BOARD_OWNER &&
      targetMember.userId !== currentUserId
    ) {
      throw new Error('Cannot remove board owner');
    }

    await this.boardMemberRepository.delete({ id: targetMember.id });

    // Invalidate RBAC cache for the removed board member
    await rbacProvider.clearCache(userIdToRemove, boardId);

    return {
      message: 'Member removed successfully',
    };
  }
}
