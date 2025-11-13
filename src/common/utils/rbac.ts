import { BoardMembers } from '@/common/entities/board-member.entity';
import { CardMembers } from '@/common/entities/card-members.entity';
import { WorkspaceMembers } from '@/common/entities/workspace-member.entity';
import { AppDataSource } from '@/config/data-source';

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
    const members = await AppDataSource.getRepository(BoardMembers).find({
      where: { userId, boardId },
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
