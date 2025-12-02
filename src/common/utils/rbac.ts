import { BoardMembers } from '@/common/entities/board-member.entity';
import { CardMembers } from '@/common/entities/card-members.entity';
import { WorkspaceMembers } from '@/common/entities/workspace-member.entity';
import { AppDataSource } from '@/config/data-source';
import { Board } from '@/common/entities/board.entity';
import { ROLES } from '@/common/constants/roles';
import { PERMISSION_GROUPS } from '@/common/constants/permissions';

export class RbacProvider {
  // Lấy roles của user trong workspace
  static async getUserRolesInWorkspace(
    userId: string,
    workspaceId: string
  ): Promise<string[]> {
    const members = await AppDataSource.getRepository(WorkspaceMembers).find({
      where: { userId, workspaceId },
      relations: ['role'],
    });

    return Array.from(
      new Set(members.map((m) => m.role.name.toLowerCase().trim()))
    );
  }

  // Lấy roles của user trong board
  static async getUserRolesInBoard(
    userId: string,
    boardId: string
  ): Promise<string[]> {
    const members = await AppDataSource.getRepository(BoardMembers).find({
      where: { userId, boardId },
      relations: ['role'],
    });

    return Array.from(
      new Set(members.map((m) => m.role.name.toLowerCase().trim()))
    );
  }

  // Lấy roles của user trong card
  static async getUserRolesInCard(
    userId: string,
    cardId: string
  ): Promise<string[]> {
    const members = await AppDataSource.getRepository(CardMembers).find({
      where: { userId, cardId },
      relations: ['role'],
    });

    return Array.from(
      new Set(members.map((m) => m.role.name.toLowerCase().trim()))
    );
  }

  // Lấy permissions trong workspace
  static async getUserPermissionsInWorkspace(
    userId: string,
    workspaceId: string
  ): Promise<string[]> {
    const members = await AppDataSource.getRepository(WorkspaceMembers).find({
      where: { userId, workspaceId },
      relations: [
        'role',
        'role.rolePermissions',
        'role.rolePermissions.permission',
      ],
    });

    const permissions = members.flatMap((m) =>
      m.role.rolePermissions.map((rp) =>
        rp.permission.name.toLowerCase().trim()
      )
    );

    return Array.from(new Set(permissions));
  }

  // Lấy permissions trong board
  static async getUserPermissionsInBoard(
    userId: string,
    boardId: string
  ): Promise<string[]> {
    // Query board và memberships
    const board = await AppDataSource.getRepository(Board).findOne({
      where: { id: boardId },
      relations: ['workspace'],
    });

    if (!board) {
      return [];
    }

    // Query board và workspace members song song
    const [boardMembers, workspaceMembers] = await Promise.all([
      AppDataSource.getRepository(BoardMembers).find({
        where: { userId, boardId },
        relations: [
          'role',
          'role.rolePermissions',
          'role.rolePermissions.permission',
        ],
      }),
      board.workspace?.id
        ? AppDataSource.getRepository(WorkspaceMembers).find({
            where: { userId, workspaceId: board.workspace.id },
            relations: [
              'role',
              'role.rolePermissions',
              'role.rolePermissions.permission',
            ],
          })
        : Promise.resolve([]),
    ]);

    // 🔍 LAYER 2: Direct board permissions
    const directPermissions = boardMembers.flatMap((m) =>
      m.role.rolePermissions.map((rp) =>
        rp.permission.name.toLowerCase().trim()
      )
    );

    // 🔍 LAYER 3: Inherited workspace permissions
    // Workspace Admin/Owner → Full board permissions
    const workspaceRoles = workspaceMembers.map((m) =>
      m.role.name.toLowerCase().trim()
    );

    const isWorkspaceAdmin =
      workspaceRoles.includes(ROLES.WORKSPACE_ADMIN.toLowerCase()) ||
      workspaceRoles.includes(ROLES.ADMIN.toLowerCase());

    let inheritedPermissions: string[] = [];

    if (isWorkspaceAdmin) {
      // Workspace admin inherit ALL board permissions
      inheritedPermissions = [
        ...PERMISSION_GROUPS.BOARDS.map((p) => p.toLowerCase()),
        ...PERMISSION_GROUPS.LISTS.map((p) => p.toLowerCase()),
        ...PERMISSION_GROUPS.CARDS.map((p) => p.toLowerCase()),
        ...PERMISSION_GROUPS.COMMENTS.map((p) => p.toLowerCase()),
        ...PERMISSION_GROUPS.MEMBERS.map((p) => p.toLowerCase()),
        ...PERMISSION_GROUPS.LABELS.map((p) => p.toLowerCase()),
        ...PERMISSION_GROUPS.CHECKLISTS.map((p) => p.toLowerCase()),
        ...PERMISSION_GROUPS.ATTACHMENTS.map((p) => p.toLowerCase()),
      ];
    } else if (
      board.visibility === 'workspace' &&
      workspaceMembers.length > 0
    ) {
      // Workspace member trong workspace-visible board → Read-only permissions
      inheritedPermissions = [
        'boards:read',
        'lists:read',
        'cards:read',
        'comments:read',
        'members:read',
        'labels:read',
        'checklists:read',
        'attachments:read',
      ];
    }

    // Gộp tất cả permissions và loại bỏ duplicate
    const allPermissions = [...directPermissions, ...inheritedPermissions];
    return Array.from(new Set(allPermissions));
  }

  /**
   * 🔒 4-LAYER AUTHORIZATION STRATEGY
   * Kiểm tra quyền truy cập board theo kiến trúc Hierarchical Scoped RBAC
   *
   * Layer 1: Visibility Check (Public access)
   * Layer 2: Direct Board Membership (BoardMembers)
   * Layer 3: Inherited Workspace Membership (WorkspaceMembers)
   * Layer 4: Guest Access (Board member nhưng không phải workspace member)
   *
   * @returns Detailed access information với roles và permissions
   */
  static async checkBoardAccess(
    userId: string,
    boardId: string
  ): Promise<{
    visibility: 'public' | 'private' | 'workspace';
    hasAccess: boolean;
    accessLevel:
      | 'public'
      | 'guest'
      | 'board-member'
      | 'workspace-member'
      | 'none';
    isBoardMember: boolean;
    isWorkspaceMember: boolean;
    boardRole?: string;
    workspaceRole?: string;
    effectiveRole?: string; // Role cuối cùng được áp dụng
  }> {
    // Query board với workspace info
    const board = await AppDataSource.getRepository(Board).findOne({
      where: { id: boardId },
      relations: ['workspace'],
    });

    if (!board) {
      throw new Error('Board not found');
    }

    // Query memberships song song để tối ưu performance
    const [boardMember, workspaceMember] = await Promise.all([
      AppDataSource.getRepository(BoardMembers).findOne({
        where: { userId, boardId },
        relations: ['role'],
      }),
      board.workspace?.id
        ? AppDataSource.getRepository(WorkspaceMembers).findOne({
            where: { userId, workspaceId: board.workspace.id },
            relations: ['role'],
          })
        : Promise.resolve(null),
    ]);

    const visibility = board.visibility as 'public' | 'private' | 'workspace';
    const isBoardMember = !!boardMember;
    const isWorkspaceMember = !!workspaceMember;
    const boardRole = boardMember?.role?.name.toLowerCase().trim();
    const workspaceRole = workspaceMember?.role?.name.toLowerCase().trim();

    // 🔍 LAYER 1: Visibility Check
    if (visibility === 'public') {
      return {
        visibility,
        hasAccess: true,
        accessLevel: 'public',
        isBoardMember,
        isWorkspaceMember,
        boardRole,
        workspaceRole,
        effectiveRole: boardRole || 'public-viewer',
      };
    }

    // 🔍 LAYER 2: Direct Board Membership
    if (isBoardMember) {
      return {
        visibility,
        hasAccess: true,
        accessLevel: isWorkspaceMember ? 'board-member' : 'guest',
        isBoardMember,
        isWorkspaceMember,
        boardRole,
        workspaceRole,
        effectiveRole: boardRole,
      };
    }

    // 🔍 LAYER 3: Inherited Workspace Membership
    if (visibility === 'workspace' && isWorkspaceMember) {
      // Workspace member có thể XEM board workspace visibility
      // Nhưng không có quyền SỬA trừ khi là workspace admin
      const isWorkspaceAdmin =
        workspaceRole === ROLES.WORKSPACE_ADMIN.toLowerCase() ||
        workspaceRole === ROLES.ADMIN.toLowerCase();

      return {
        visibility,
        hasAccess: true,
        accessLevel: 'workspace-member',
        isBoardMember,
        isWorkspaceMember,
        boardRole,
        workspaceRole,
        effectiveRole: isWorkspaceAdmin
          ? 'inherited-admin'
          : 'workspace-viewer',
      };
    }

    // 🔍 LAYER 4: No Access
    return {
      visibility,
      hasAccess: false,
      accessLevel: 'none',
      isBoardMember,
      isWorkspaceMember,
      boardRole,
      workspaceRole,
      effectiveRole: undefined,
    };
  }

  // Lấy permissions trong card
  static async getUserPermissionsInCard(
    userId: string,
    cardId: string
  ): Promise<string[]> {
    const members = await AppDataSource.getRepository(CardMembers).find({
      where: { userId, cardId },
      relations: [
        'role',
        'role.rolePermissions',
        'role.rolePermissions.permission',
      ],
    });

    const permissions = members.flatMap((m) =>
      m.role.rolePermissions.map((rp) =>
        rp.permission.name.toLowerCase().trim()
      )
    );

    return Array.from(new Set(permissions));
  }

  // Lấy tất cả roles của user
  static async getUserAllRoles(userId: string): Promise<string[]> {
    const [workspaceMembers, boardMembers, cardMembers] = await Promise.all([
      AppDataSource.getRepository(WorkspaceMembers).find({
        where: { userId },
        relations: ['role'],
      }),
      AppDataSource.getRepository(BoardMembers).find({
        where: { userId },
        relations: ['role'],
      }),
      AppDataSource.getRepository(CardMembers).find({
        where: { userId },
        relations: ['role'],
      }),
    ]);

    const allRoles = [
      ...workspaceMembers.map((m) => m.role.name.toLowerCase().trim()),
      ...boardMembers.map((m) => m.role.name.toLowerCase().trim()),
      ...cardMembers.map((m) => m.role.name.toLowerCase().trim()),
    ];

    return Array.from(new Set(allRoles));
  }

  // Lấy tất cả permissions của user
  static async getUserAllPermissions(userId: string): Promise<string[]> {
    const [workspaceMembers, boardMembers, cardMembers] = await Promise.all([
      AppDataSource.getRepository(WorkspaceMembers).find({
        where: { userId },
        relations: [
          'role',
          'role.rolePermissions',
          'role.rolePermissions.permission',
        ],
      }),
      AppDataSource.getRepository(BoardMembers).find({
        where: { userId },
        relations: [
          'role',
          'role.rolePermissions',
          'role.rolePermissions.permission',
        ],
      }),
      AppDataSource.getRepository(CardMembers).find({
        where: { userId },
        relations: [
          'role',
          'role.rolePermissions',
          'role.rolePermissions.permission',
        ],
      }),
    ]);

    const allPermissions = [
      ...workspaceMembers.flatMap((m) =>
        m.role.rolePermissions.map((rp) =>
          rp.permission.name.toLowerCase().trim()
        )
      ),
      ...boardMembers.flatMap((m) =>
        m.role.rolePermissions.map((rp) =>
          rp.permission.name.toLowerCase().trim()
        )
      ),
      ...cardMembers.flatMap((m) =>
        m.role.rolePermissions.map((rp) =>
          rp.permission.name.toLowerCase().trim()
        )
      ),
    ];

    return Array.from(new Set(allPermissions));
  }

  // Helper: attachUserAuthz
  static async attachUserAuthz(
    userId: string,
    context?: { type: 'workspace' | 'board' | 'card'; id: string }
  ) {
    if (!context) {
      const [roles, permissions] = await Promise.all([
        this.getUserAllRoles(userId),
        this.getUserAllPermissions(userId),
      ]);
      return { roles, permissions };
    }

    let roles: string[] = [];
    let permissions: string[] = [];

    switch (context.type) {
      case 'workspace':
        [roles, permissions] = await Promise.all([
          this.getUserRolesInWorkspace(userId, context.id),
          this.getUserPermissionsInWorkspace(userId, context.id),
        ]);
        break;
      case 'board':
        [roles, permissions] = await Promise.all([
          this.getUserRolesInBoard(userId, context.id),
          this.getUserPermissionsInBoard(userId, context.id),
        ]);
        break;
      case 'card':
        [roles, permissions] = await Promise.all([
          this.getUserRolesInCard(userId, context.id),
          this.getUserPermissionsInCard(userId, context.id),
        ]);
        break;
    }

    return { roles, permissions };
  }
}
