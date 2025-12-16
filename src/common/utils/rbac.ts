import { AppDataSource } from '@/config/data-source';
import { WorkspaceMembers } from '@/common/entities/workspace-member.entity';
import { BoardMembers } from '@/common/entities/board-member.entity';
import { Board } from '@/common/entities/board.entity';
import { Workspace } from '@/common/entities/workspace.entity';
import { List } from '@/common/entities/list.entity';
import { Card } from '@/common/entities/card.entity';
import { ROLES, Role } from '@/common/constants/roles';
import { Permission, PERMISSIONS } from '@/common/constants/permissions';

export type ResourceType = 'workspace' | 'board' | 'list' | 'card';
export type BoardVisibility = 'private' | 'workspace' | 'public';
export type WorkspaceVisibility = 'private' | 'public';

export interface UserContext {
  userId: string;
  workspaceRole?: Role;
  boardRole?: Role;
  isWorkspaceMember: boolean;
  isBoardMember: boolean;
}

export interface AccessResult {
  allowed: boolean;
  reason?: string;
  userContext?: UserContext;
}

const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  // System Admin - Full access
  [ROLES.ADMIN]: Object.values(PERMISSIONS),

  // Workspace Admin - Quản lý workspace
  [ROLES.WORKSPACE_ADMIN]: [
    PERMISSIONS.WORKSPACES_READ,
    PERMISSIONS.WORKSPACES_UPDATE,
    PERMISSIONS.WORKSPACES_DELETE,
    PERMISSIONS.WORKSPACES_MANAGE,
    PERMISSIONS.BOARDS_CREATE,
    PERMISSIONS.BOARDS_READ,
    PERMISSIONS.BOARDS_UPDATE,
    PERMISSIONS.BOARDS_DELETE,
    PERMISSIONS.BOARDS_MANAGE,
    PERMISSIONS.MEMBERS_INVITE,
    PERMISSIONS.MEMBERS_REMOVE,
    PERMISSIONS.MEMBERS_READ,
    PERMISSIONS.MEMBERS_MANAGE,
    PERMISSIONS.LISTS_CREATE,
    PERMISSIONS.LISTS_READ,
    PERMISSIONS.LISTS_UPDATE,
    PERMISSIONS.LISTS_DELETE,
    PERMISSIONS.LISTS_ARCHIVE,
    PERMISSIONS.CARDS_CREATE,
    PERMISSIONS.CARDS_READ,
    PERMISSIONS.CARDS_UPDATE,
    PERMISSIONS.CARDS_DELETE,
    PERMISSIONS.CARDS_ASSIGN,
    PERMISSIONS.CARDS_MOVE,
    PERMISSIONS.CARDS_ARCHIVE,
    PERMISSIONS.COMMENTS_CREATE,
    PERMISSIONS.COMMENTS_READ,
    PERMISSIONS.COMMENTS_UPDATE,
    PERMISSIONS.COMMENTS_DELETE,
    PERMISSIONS.COMMENTS_MODERATE,
    PERMISSIONS.LABELS_CREATE,
    PERMISSIONS.LABELS_READ,
    PERMISSIONS.LABELS_UPDATE,
    PERMISSIONS.LABELS_DELETE,
    PERMISSIONS.CHECKLISTS_CREATE,
    PERMISSIONS.CHECKLISTS_READ,
    PERMISSIONS.CHECKLISTS_UPDATE,
    PERMISSIONS.CHECKLISTS_DELETE,
    PERMISSIONS.ATTACHMENTS_CREATE,
    PERMISSIONS.ATTACHMENTS_READ,
    PERMISSIONS.ATTACHMENTS_DELETE,
  ],

  // Workspace Moderator - Moderate content
  [ROLES.WORKSPACE_MODERATOR]: [
    PERMISSIONS.WORKSPACES_READ,
    PERMISSIONS.BOARDS_CREATE,
    PERMISSIONS.BOARDS_READ,
    PERMISSIONS.BOARDS_UPDATE,
    PERMISSIONS.MEMBERS_INVITE,
    PERMISSIONS.MEMBERS_READ,
    PERMISSIONS.LISTS_CREATE,
    PERMISSIONS.LISTS_READ,
    PERMISSIONS.LISTS_UPDATE,
    PERMISSIONS.LISTS_DELETE,
    PERMISSIONS.LISTS_ARCHIVE,
    PERMISSIONS.CARDS_CREATE,
    PERMISSIONS.CARDS_READ,
    PERMISSIONS.CARDS_UPDATE,
    PERMISSIONS.CARDS_DELETE,
    PERMISSIONS.CARDS_ASSIGN,
    PERMISSIONS.CARDS_MOVE,
    PERMISSIONS.CARDS_ARCHIVE,
    PERMISSIONS.COMMENTS_CREATE,
    PERMISSIONS.COMMENTS_READ,
    PERMISSIONS.COMMENTS_UPDATE,
    PERMISSIONS.COMMENTS_DELETE,
    PERMISSIONS.COMMENTS_MODERATE,
    PERMISSIONS.LABELS_CREATE,
    PERMISSIONS.LABELS_READ,
    PERMISSIONS.LABELS_UPDATE,
    PERMISSIONS.LABELS_DELETE,
    PERMISSIONS.CHECKLISTS_CREATE,
    PERMISSIONS.CHECKLISTS_READ,
    PERMISSIONS.CHECKLISTS_UPDATE,
    PERMISSIONS.CHECKLISTS_DELETE,
    PERMISSIONS.ATTACHMENTS_CREATE,
    PERMISSIONS.ATTACHMENTS_READ,
    PERMISSIONS.ATTACHMENTS_DELETE,
  ],

  // Workspace Member - Standard member
  [ROLES.WORKSPACE_MEMBER]: [
    PERMISSIONS.WORKSPACES_READ,
    PERMISSIONS.BOARDS_CREATE,
    PERMISSIONS.BOARDS_READ,
    PERMISSIONS.MEMBERS_READ,
    PERMISSIONS.LISTS_CREATE,
    PERMISSIONS.LISTS_READ,
    PERMISSIONS.LISTS_UPDATE,
    PERMISSIONS.CARDS_CREATE,
    PERMISSIONS.CARDS_READ,
    PERMISSIONS.CARDS_UPDATE,
    PERMISSIONS.CARDS_ASSIGN,
    PERMISSIONS.CARDS_MOVE,
    PERMISSIONS.COMMENTS_CREATE,
    PERMISSIONS.COMMENTS_READ,
    PERMISSIONS.COMMENTS_UPDATE,
    PERMISSIONS.LABELS_READ,
    PERMISSIONS.CHECKLISTS_CREATE,
    PERMISSIONS.CHECKLISTS_READ,
    PERMISSIONS.CHECKLISTS_UPDATE,
    PERMISSIONS.ATTACHMENTS_CREATE,
    PERMISSIONS.ATTACHMENTS_READ,
  ],

  // Workspace Observer - View only
  [ROLES.WORKSPACE_OBSERVER]: [
    PERMISSIONS.WORKSPACES_READ,
    PERMISSIONS.BOARDS_READ,
    PERMISSIONS.MEMBERS_READ,
    PERMISSIONS.LISTS_READ,
    PERMISSIONS.CARDS_READ,
    PERMISSIONS.COMMENTS_READ,
    PERMISSIONS.LABELS_READ,
    PERMISSIONS.CHECKLISTS_READ,
    PERMISSIONS.ATTACHMENTS_READ,
  ],

  // Board Owner - Full board control
  [ROLES.BOARD_OWNER]: [
    PERMISSIONS.BOARDS_READ,
    PERMISSIONS.BOARDS_UPDATE,
    PERMISSIONS.BOARDS_DELETE,
    PERMISSIONS.BOARDS_MANAGE,
    PERMISSIONS.MEMBERS_INVITE,
    PERMISSIONS.MEMBERS_REMOVE,
    PERMISSIONS.MEMBERS_READ,
    PERMISSIONS.MEMBERS_MANAGE,
    PERMISSIONS.LISTS_CREATE,
    PERMISSIONS.LISTS_READ,
    PERMISSIONS.LISTS_UPDATE,
    PERMISSIONS.LISTS_DELETE,
    PERMISSIONS.LISTS_ARCHIVE,
    PERMISSIONS.CARDS_CREATE,
    PERMISSIONS.CARDS_READ,
    PERMISSIONS.CARDS_UPDATE,
    PERMISSIONS.CARDS_DELETE,
    PERMISSIONS.CARDS_ASSIGN,
    PERMISSIONS.CARDS_MOVE,
    PERMISSIONS.CARDS_ARCHIVE,
    PERMISSIONS.COMMENTS_CREATE,
    PERMISSIONS.COMMENTS_READ,
    PERMISSIONS.COMMENTS_UPDATE,
    PERMISSIONS.COMMENTS_DELETE,
    PERMISSIONS.COMMENTS_MODERATE,
    PERMISSIONS.LABELS_CREATE,
    PERMISSIONS.LABELS_READ,
    PERMISSIONS.LABELS_UPDATE,
    PERMISSIONS.LABELS_DELETE,
    PERMISSIONS.CHECKLISTS_CREATE,
    PERMISSIONS.CHECKLISTS_READ,
    PERMISSIONS.CHECKLISTS_UPDATE,
    PERMISSIONS.CHECKLISTS_DELETE,
    PERMISSIONS.ATTACHMENTS_CREATE,
    PERMISSIONS.ATTACHMENTS_READ,
    PERMISSIONS.ATTACHMENTS_DELETE,
  ],

  // Board Admin - Manage board
  [ROLES.BOARD_ADMIN]: [
    PERMISSIONS.BOARDS_READ,
    PERMISSIONS.BOARDS_UPDATE,
    PERMISSIONS.MEMBERS_INVITE,
    PERMISSIONS.MEMBERS_REMOVE,
    PERMISSIONS.MEMBERS_READ,
    PERMISSIONS.LISTS_CREATE,
    PERMISSIONS.LISTS_READ,
    PERMISSIONS.LISTS_UPDATE,
    PERMISSIONS.LISTS_DELETE,
    PERMISSIONS.LISTS_ARCHIVE,
    PERMISSIONS.CARDS_CREATE,
    PERMISSIONS.CARDS_READ,
    PERMISSIONS.CARDS_UPDATE,
    PERMISSIONS.CARDS_DELETE,
    PERMISSIONS.CARDS_ASSIGN,
    PERMISSIONS.CARDS_MOVE,
    PERMISSIONS.CARDS_ARCHIVE,
    PERMISSIONS.COMMENTS_CREATE,
    PERMISSIONS.COMMENTS_READ,
    PERMISSIONS.COMMENTS_UPDATE,
    PERMISSIONS.COMMENTS_DELETE,
    PERMISSIONS.LABELS_CREATE,
    PERMISSIONS.LABELS_READ,
    PERMISSIONS.LABELS_UPDATE,
    PERMISSIONS.LABELS_DELETE,
    PERMISSIONS.CHECKLISTS_CREATE,
    PERMISSIONS.CHECKLISTS_READ,
    PERMISSIONS.CHECKLISTS_UPDATE,
    PERMISSIONS.CHECKLISTS_DELETE,
    PERMISSIONS.ATTACHMENTS_CREATE,
    PERMISSIONS.ATTACHMENTS_READ,
    PERMISSIONS.ATTACHMENTS_DELETE,
  ],

  // Board Member - Standard member
  [ROLES.BOARD_MEMBER]: [
    PERMISSIONS.BOARDS_READ,
    PERMISSIONS.MEMBERS_READ,
    PERMISSIONS.LISTS_CREATE,
    PERMISSIONS.LISTS_READ,
    PERMISSIONS.LISTS_UPDATE,
    PERMISSIONS.CARDS_CREATE,
    PERMISSIONS.CARDS_READ,
    PERMISSIONS.CARDS_UPDATE,
    PERMISSIONS.CARDS_ASSIGN,
    PERMISSIONS.CARDS_MOVE,
    PERMISSIONS.COMMENTS_CREATE,
    PERMISSIONS.COMMENTS_READ,
    PERMISSIONS.COMMENTS_UPDATE,
    PERMISSIONS.LABELS_READ,
    PERMISSIONS.CHECKLISTS_CREATE,
    PERMISSIONS.CHECKLISTS_READ,
    PERMISSIONS.CHECKLISTS_UPDATE,
    PERMISSIONS.ATTACHMENTS_CREATE,
    PERMISSIONS.ATTACHMENTS_READ,
  ],

  // Board Observer - View only
  [ROLES.BOARD_OBSERVER]: [
    PERMISSIONS.BOARDS_READ,
    PERMISSIONS.MEMBERS_READ,
    PERMISSIONS.LISTS_READ,
    PERMISSIONS.CARDS_READ,
    PERMISSIONS.COMMENTS_READ,
    PERMISSIONS.LABELS_READ,
    PERMISSIONS.CHECKLISTS_READ,
    PERMISSIONS.ATTACHMENTS_READ,
  ],

  // Regular User
  [ROLES.USER]: [
    PERMISSIONS.WORKSPACES_CREATE,
    PERMISSIONS.WORKSPACES_READ,
    PERMISSIONS.BOARDS_READ,
    PERMISSIONS.USERS_READ,
    PERMISSIONS.USERS_UPDATE,
  ],

  // Guest - Very limited
  [ROLES.GUEST]: [PERMISSIONS.BOARDS_READ, PERMISSIONS.CARDS_READ],
};

export class RBACProvider {
  private workspaceMemberRepo = AppDataSource.getRepository(WorkspaceMembers);
  private boardMemberRepo = AppDataSource.getRepository(BoardMembers);
  private boardRepo = AppDataSource.getRepository(Board);
  private workspaceRepo = AppDataSource.getRepository(Workspace);
  private listRepo = AppDataSource.getRepository(List);
  private cardRepo = AppDataSource.getRepository(Card);

  private cache = new Map<string, { data: any; expiry: number }>();
  private CACHE_TTL = 30000;

  private getCached<T>(key: string): T | null {
    const cached = this.cache.get(key);
    if (cached && cached.expiry > Date.now()) {
      return cached.data as T;
    }
    this.cache.delete(key);
    return null;
  }

  private setCache(key: string, data: any): void {
    this.cache.set(key, { data, expiry: Date.now() + this.CACHE_TTL });
  }

  async getWorkspaceMembership(
    userId: string,
    workspaceId: string
  ): Promise<{ role: Role; member: WorkspaceMembers } | null> {
    const cacheKey = `ws_member_${userId}_${workspaceId}`;
    const cached = this.getCached<{ role: Role; member: WorkspaceMembers }>(
      cacheKey
    );
    if (cached) return cached;

    const member = await this.workspaceMemberRepo
      .createQueryBuilder('wm')
      .leftJoin('wm.role', 'role')
      .where('wm.userId = :userId', { userId })
      .andWhere('wm.workspaceId = :workspaceId', { workspaceId })
      .select(['wm.id', 'wm.userId', 'wm.workspaceId', 'role.name'])
      .getOne();

    if (!member) return null;

    const result = { role: member.role.name as Role, member };
    this.setCache(cacheKey, result);
    return result;
  }

  async getBoardMembership(
    userId: string,
    boardId: string
  ): Promise<{ role: Role; member: BoardMembers } | null> {
    const cacheKey = `board_member_${userId}_${boardId}`;
    const cached = this.getCached<{ role: Role; member: BoardMembers }>(
      cacheKey
    );
    if (cached) return cached;

    const member = await this.boardMemberRepo
      .createQueryBuilder('bm')
      .leftJoin('bm.role', 'role')
      .where('bm.userId = :userId', { userId })
      .andWhere('bm.boardId = :boardId', { boardId })
      .select(['bm.id', 'bm.userId', 'bm.boardId', 'role.name'])
      .getOne();

    if (!member) return null;

    const result = { role: member.role.name as Role, member };
    this.setCache(cacheKey, result);
    return result;
  }

  async getBoardIdFromList(listId: string): Promise<string | null> {
    const cacheKey = `list_board_${listId}`;
    const cached = this.getCached<string>(cacheKey);
    if (cached) return cached;

    const list = await this.listRepo
      .createQueryBuilder('list')
      .leftJoin('list.board', 'board')
      .where('list.id = :listId', { listId })
      .select(['list.id', 'board.id'])
      .getOne();

    if (!list?.board?.id) return null;

    this.setCache(cacheKey, list.board.id);
    return list.board.id;
  }

  async getBoardIdFromCard(cardId: string): Promise<string | null> {
    const cacheKey = `card_board_${cardId}`;
    const cached = this.getCached<string>(cacheKey);
    if (cached) return cached;

    const card = await this.cardRepo
      .createQueryBuilder('card')
      .leftJoin('card.board', 'board')
      .where('card.id = :cardId', { cardId })
      .select(['card.id', 'board.id'])
      .getOne();

    if (!card?.board?.id) return null;

    this.setCache(cacheKey, card.board.id);
    return card.board.id;
  }

  async canViewWorkspace(
    userId: string | null,
    workspaceId: string
  ): Promise<AccessResult> {
    const workspace = await this.workspaceRepo.findOne({
      where: { id: workspaceId },
      select: ['id', 'visibility', 'isArchived'],
    });

    if (!workspace) {
      return { allowed: false, reason: 'Workspace not found' };
    }

    if (workspace.isArchived) {
      return { allowed: false, reason: 'Workspace is archived' };
    }

    // Public workspace - ai cũng xem được
    if (workspace.visibility === 'public') {
      return { allowed: true };
    }

    // Private workspace - phải là member
    if (!userId) {
      return { allowed: false, reason: 'Authentication required' };
    }

    const membership = await this.getWorkspaceMembership(userId, workspaceId);
    if (!membership) {
      return { allowed: false, reason: 'Not a workspace member' };
    }

    return {
      allowed: true,
      userContext: {
        userId,
        workspaceRole: membership.role,
        isWorkspaceMember: true,
        isBoardMember: false,
      },
    };
  }

  async canViewBoard(
    userId: string | null,
    boardId: string
  ): Promise<AccessResult> {
    const board = await this.boardRepo
      .createQueryBuilder('board')
      .leftJoin('board.workspace', 'workspace')
      .where('board.id = :boardId', { boardId })
      .select([
        'board.id',
        'board.visibility',
        'board.isClosed',
        'workspace.id',
        'workspace.visibility',
      ])
      .getOne();

    if (!board) {
      return { allowed: false, reason: 'Board not found' };
    }

    if (board.isClosed) {
      // Board closed - chỉ board members mới xem được
      if (!userId) {
        return { allowed: false, reason: 'Board is closed' };
      }
      const boardMembership = await this.getBoardMembership(userId, boardId);
      if (!boardMembership) {
        return { allowed: false, reason: 'Board is closed' };
      }
    }

    const visibility = board.visibility as BoardVisibility;

    if (visibility === 'public') {
      return { allowed: true };
    }

    if (!userId) {
      return { allowed: false, reason: 'Authentication required' };
    }

    if (visibility === 'workspace') {
      const workspaceMembership = await this.getWorkspaceMembership(
        userId,
        board.workspace.id
      );
      if (workspaceMembership) {
        return {
          allowed: true,
          userContext: {
            userId,
            workspaceRole: workspaceMembership.role,
            isWorkspaceMember: true,
            isBoardMember: false,
          },
        };
      }
    }

    const boardMembership = await this.getBoardMembership(userId, boardId);
    if (boardMembership) {
      const workspaceMembership = await this.getWorkspaceMembership(
        userId,
        board.workspace.id
      );
      return {
        allowed: true,
        userContext: {
          userId,
          workspaceRole: workspaceMembership?.role,
          boardRole: boardMembership.role,
          isWorkspaceMember: !!workspaceMembership,
          isBoardMember: true,
        },
      };
    }

    return { allowed: false, reason: 'Not authorized to view this board' };
  }

  async hasWorkspacePermission(
    userId: string,
    workspaceId: string,
    permission: Permission
  ): Promise<boolean> {
    const membership = await this.getWorkspaceMembership(userId, workspaceId);
    if (!membership) return false;

    const rolePermissions = ROLE_PERMISSIONS[membership.role] || [];
    console.log(
      'Checking permission:',
      permission,
      ". User's permissions:\n",
      rolePermissions
    );
    return rolePermissions.includes(permission);
  }

  async hasBoardPermission(
    userId: string,
    boardId: string,
    permission: Permission
  ): Promise<boolean> {
    const board = await this.boardRepo.findOne({
      where: { id: boardId },
      relations: ['workspace'],
      select: ['id', 'visibility'],
    });

    if (!board) return false;

    const boardMembership = await this.getBoardMembership(userId, boardId);
    const boardPermissions = boardMembership
      ? ROLE_PERMISSIONS[boardMembership.role] || []
      : [];

    const workspaceMembership = await this.getWorkspaceMembership(
      userId,
      board.workspace.id
    );
    const workspacePermissions = workspaceMembership
      ? ROLE_PERMISSIONS[workspaceMembership.role] || []
      : [];
    console.log(
      'Checking permission:',
      permission,
      ". User's board permissions:\n",
      boardPermissions,
      "\nUser's workspace permissions:\n",
      workspacePermissions
    );
    return (
      boardPermissions.includes(permission) ||
      workspacePermissions.includes(permission)
    );
  }

  async getEffectiveBoardRole(
    userId: string,
    boardId: string
  ): Promise<Role | null> {
    const board = await this.boardRepo.findOne({
      where: { id: boardId },
      relations: ['workspace'],
    });

    if (!board) return null;

    const [boardMembership, workspaceMembership] = await Promise.all([
      this.getBoardMembership(userId, boardId),
      this.getWorkspaceMembership(userId, board.workspace.id),
    ]);

    if (workspaceMembership) {
      const adminRoles: Role[] = [
        ROLES.WORKSPACE_ADMIN,
        ROLES.WORKSPACE_MODERATOR,
      ];
      if (adminRoles.includes(workspaceMembership.role)) {
        return workspaceMembership.role;
      }
    }

    if (boardMembership) {
      return boardMembership.role;
    }

    if (board.visibility === 'workspace' && workspaceMembership) {
      return workspaceMembership.role;
    }

    return null;
  }

  static roleHasPermission(role: Role, permission: Permission): boolean {
    const permissions = ROLE_PERMISSIONS[role] || [];
    return permissions.includes(permission);
  }

  static getRolePermissions(role: Role): Permission[] {
    return ROLE_PERMISSIONS[role] || [];
  }

  clearCache(userId?: string, resourceId?: string): void {
    if (userId && resourceId) {
      this.cache.delete(`ws_member_${userId}_${resourceId}`);
      this.cache.delete(`board_member_${userId}_${resourceId}`);
    } else {
      this.cache.clear();
    }
  }
}

export const rbacProvider = new RBACProvider();

export { ROLE_PERMISSIONS };
