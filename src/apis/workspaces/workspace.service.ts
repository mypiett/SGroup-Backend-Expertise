import { AppDataSource } from '../../config/data-source';
import { User } from '../../common/entities/user.entity';
import {
  createWorkspaceDto,
  UpdateWorkspaceDto,
  AddMemberDto,
  UpdateMemberRoleDto,
} from './workspace.dto';
import { Workspace } from '../../common/entities/workspace.entity';
import { WorkspaceMembers } from '../../common/entities/workspace-member.entity';
import { Role } from '../../common/entities/role.entity';
import { ROLES } from '../../common/constants';

export class WorkspaceService {
  private workspaceRepository = AppDataSource.getRepository(Workspace);
  private userRepository = AppDataSource.getRepository(User);
  private workspaceMemberRepository =
    AppDataSource.getRepository(WorkspaceMembers);
  private roleRepository = AppDataSource.getRepository(Role);

  async createWorkspace(userId: string, data: createWorkspaceDto) {
    // Tìm user và role song song vì không phụ thuộc vào nhau
    const [user, adminRole] = await Promise.all([
      this.userRepository.findOne({ where: { id: userId } }),
      this.roleRepository.findOne({
        where: { name: ROLES.WORKSPACE_ADMIN },
      }),
    ]);

    if (!user) {
      throw new Error('User not found');
    }

    if (!adminRole) {
      throw new Error('Workspace admin role not found');
    }

    // Tạo workspace mới
    const newWorkspace = this.workspaceRepository.create({
      title: data.title,
      description: data.description,
      visibility: data.visibility || 'private',
      isArchived: false,
    });

    const savedWorkspace = await this.workspaceRepository.save(newWorkspace);

    // Thêm user vào workspace với role admin
    const workspaceMember = this.workspaceMemberRepository.create({
      userId: user.id,
      workspaceId: savedWorkspace.id,
      roleId: adminRole.id,
    });
    await this.workspaceMemberRepository.save(workspaceMember);

    return savedWorkspace;
  }

  async getAllWorkspaces() {
    return await this.workspaceRepository.find({
      where: { isArchived: false },
      relations: [
        'workspaceMembers',
        'workspaceMembers.user',
        'workspaceMembers.role',
      ],
    });
  }

  async getWorkspaceById(id: string) {
    const workspace = await this.workspaceRepository.findOne({
      where: { id, isArchived: false },
      relations: [
        'boards',
        'workspaceMembers',
        'workspaceMembers.user',
        'workspaceMembers.role',
      ],
    });
    if (!workspace) throw new Error('Workspace not found');
    return workspace;
  }

  async updateWorkspace(id: string, data: UpdateWorkspaceDto) {
    const workspace = await this.workspaceRepository.findOne({
      where: { id, isArchived: false },
    });
    if (!workspace) throw new Error('Workspace not found');

    Object.assign(workspace, data);
    return await this.workspaceRepository.save(workspace);
  }

  async deleteWorkspace(id: string) {
    const workspace = await this.workspaceRepository.findOne({
      where: { id },
    });
    if (!workspace) throw new Error('Workspace not found');

    workspace.isArchived = true;
    await this.workspaceRepository.save(workspace);
    return { message: 'Workspace archived successfully' };
  }

  async getWorkspacesByUserId(userId: string) {
    // Lấy tất cả workspace mà user là thành viên
    const workspaceMembers = await this.workspaceMemberRepository.find({
      where: { userId },
      relations: [
        'workspace',
        'workspace.workspaceMembers',
        'workspace.workspaceMembers.user',
        'workspace.workspaceMembers.role',
        'workspace.boards',
        'role',
      ],
    });

    // Lọc và format kết quả
    return workspaceMembers
      .filter((wm) => !wm.workspace.isArchived)
      .map((wm) => ({
        id: wm.workspace.id,
        title: wm.workspace.title,
        description: wm.workspace.description,
        visibility: wm.workspace.visibility,
        isArchived: wm.workspace.isArchived,
        createdAt: wm.workspace.createdAt,
        updatedAt: wm.workspace.updatedAt,

        myRole: wm.role,

        boards: wm.workspace.boards || [],

        members:
          wm.workspace.workspaceMembers?.map((member) => ({
            id: member.id,
            userId: member.user?.id,
            username: member.user?.name,
            email: member.user?.email,
            avatarUrl: member.user?.avatarUrl,
            role: member.role,
            joinedAt: member.createdAt,
          })) || [],
      }));
  }

  // Archive workspace
  async archiveWorkspace(id: string, userId: string) {
    // Tìm workspace và member song song
    const [workspace, member] = await Promise.all([
      this.workspaceRepository.findOne({
        where: { id },
      }),
      this.workspaceMemberRepository.findOne({
        where: { workspaceId: id, userId },
        relations: ['role'],
      }),
    ]);

    if (!workspace) {
      throw new Error('Workspace not found');
    }

    if (!member) {
      throw new Error('You are not a member of this workspace');
    }

    // Check if user has admin or moderator role
    if (
      member.role.name !== ROLES.WORKSPACE_ADMIN &&
      member.role.name !== ROLES.WORKSPACE_MODERATOR
    ) {
      throw new Error(
        'Only workspace admin or moderator can archive workspace'
      );
    }

    workspace.isArchived = true;
    await this.workspaceRepository.save(workspace);

    return { message: 'Workspace archived successfully' };
  }

  // Reopen workspace
  async reopenWorkspace(id: string, userId: string) {
    // Tìm workspace và member song song
    const [workspace, member] = await Promise.all([
      this.workspaceRepository.findOne({
        where: { id },
      }),
      this.workspaceMemberRepository.findOne({
        where: { workspaceId: id, userId },
        relations: ['role'],
      }),
    ]);

    if (!workspace) {
      throw new Error('Workspace not found');
    }

    if (!member) {
      throw new Error('You are not a member of this workspace');
    }

    // Check if user has admin or moderator role
    if (
      member.role.name !== ROLES.WORKSPACE_ADMIN &&
      member.role.name !== ROLES.WORKSPACE_MODERATOR
    ) {
      throw new Error('Only workspace admin or moderator can reopen workspace');
    }

    workspace.isArchived = false;
    await this.workspaceRepository.save(workspace);

    return { message: 'Workspace reopened successfully' };
  }

  // Add member to workspace
  async addMember(
    workspaceId: string,
    data: AddMemberDto,
    currentUserId: string
  ) {
    // Check workspace, current user, new user, existing member và role song song
    const [workspace, currentMember, user, existingMember, role] =
      await Promise.all([
        this.workspaceRepository.findOne({
          where: { id: workspaceId, isArchived: false },
        }),
        this.workspaceMemberRepository.findOne({
          where: { workspaceId, userId: currentUserId },
          relations: ['role'],
        }),
        this.userRepository.findOne({
          where: { id: data.userId },
        }),
        this.workspaceMemberRepository.findOne({
          where: { workspaceId, userId: data.userId },
        }),
        this.roleRepository.findOne({
          where: { id: data.roleId },
        }),
      ]);

    if (!workspace) {
      throw new Error('Workspace not found');
    }

    if (!currentMember) {
      throw new Error('You are not a member of this workspace');
    }

    if (
      currentMember.role.name !== ROLES.WORKSPACE_ADMIN &&
      currentMember.role.name !== ROLES.WORKSPACE_MODERATOR
    ) {
      throw new Error('Only workspace admin or moderator can add members');
    }

    if (!user) {
      throw new Error('User not found');
    }

    if (existingMember) {
      throw new Error('User is already a member of this workspace');
    }

    if (!role) {
      throw new Error('Role not found');
    }

    // Create new member
    const newMember = this.workspaceMemberRepository.create({
      workspaceId,
      userId: data.userId,
      roleId: data.roleId,
    });

    await this.workspaceMemberRepository.save(newMember);

    // Return member with relations
    const savedMember = await this.workspaceMemberRepository.findOne({
      where: { id: newMember.id },
      relations: ['user', 'role', 'workspace'],
    });

    return {
      message: 'Member added successfully',
      member: savedMember,
    };
  }

  // Update member role
  async updateMemberRole(
    workspaceId: string,
    memberId: string,
    data: UpdateMemberRoleDto,
    currentUserId: string
  ) {
    // Check workspace, current member, member to update và new role song song
    const [workspace, currentMember, member, newRole] = await Promise.all([
      this.workspaceRepository.findOne({
        where: { id: workspaceId },
      }),
      this.workspaceMemberRepository.findOne({
        where: { workspaceId, userId: currentUserId },
        relations: ['role'],
      }),
      this.workspaceMemberRepository.findOne({
        where: { id: memberId, workspaceId },
        relations: ['user', 'role'],
      }),
      this.roleRepository.findOne({
        where: { id: data.roleId },
      }),
    ]);

    if (!workspace) {
      throw new Error('Workspace not found');
    }

    if (!currentMember) {
      throw new Error('You are not a member of this workspace');
    }

    if (
      currentMember.role.name !== ROLES.WORKSPACE_ADMIN &&
      currentMember.role.name !== ROLES.WORKSPACE_MODERATOR
    ) {
      throw new Error(
        'Only workspace admin or moderator can update member roles'
      );
    }

    if (!member) {
      throw new Error('Member not found in this workspace');
    }

    if (!newRole) {
      throw new Error('Role not found');
    }

    // Phải là role trong workspace level
    if (
      newRole.name !== ROLES.WORKSPACE_ADMIN &&
      newRole.name !== ROLES.WORKSPACE_MEMBER &&
      newRole.name !== ROLES.WORKSPACE_OBSERVER &&
      newRole.name !== ROLES.WORKSPACE_MODERATOR
    ) {
      throw new Error('Invalid role for workspace member');
    }

    // Admin được hiểu là chủ sở hữu workspace, không thể thay đổi vai trò của họ
    if (member.role.name === ROLES.WORKSPACE_ADMIN) {
      throw new Error('Cannot change role of workspace admin');
    }

    if (member.roleId === newRole.id) {
      throw new Error('Member already has this role');
    }

    // member.roleId = newId;
    // await repo.save(member);

    // Note: Chỗ này không dùng save được vì roleId là khóa ngoại, nên khi save  thì chỉ đổi id còn member.role vẫn là object cũ, cần phải reload
    await this.workspaceMemberRepository
      .createQueryBuilder()
      .update()
      .set({ roleId: data.roleId })
      .where('id = :memberId', { memberId })
      .execute();

    // Fetch fresh from database to get updated relations
    const updatedMember = await this.workspaceMemberRepository.findOne({
      where: { id: memberId },
      relations: ['user', 'role', 'workspace'],
    });

    console.log('Updated member from database:', {
      id: updatedMember?.id,
      roleId: updatedMember?.roleId,
      roleName: updatedMember?.role?.name,
    });

    return {
      message: 'Member role updated successfully',
      member: updatedMember,
    };
  }

  // Get workspace members
  async getWorkspaceMembers(workspaceId: string) {
    const workspace = await this.workspaceRepository.findOne({
      where: { id: workspaceId, isArchived: false },
    });

    if (!workspace) {
      throw new Error('Workspace not found');
    }

    const members = await this.workspaceMemberRepository.find({
      where: { workspaceId },
      relations: ['user', 'role'],
    });

    return members;
  }

  // Remove member from workspace
  async removeMember(
    workspaceId: string,
    memberId: string,
    currentUserId: string
  ) {
    // Check workspace, current member và member to remove song song
    const [workspace, currentMember, member] = await Promise.all([
      this.workspaceRepository.findOne({
        where: { id: workspaceId, isArchived: false },
      }),
      this.workspaceMemberRepository.findOne({
        where: { workspaceId, userId: currentUserId },
        relations: ['role'],
      }),
      this.workspaceMemberRepository.findOne({
        where: { id: memberId, workspaceId },
      }),
    ]);

    if (!workspace) {
      throw new Error('Workspace not found');
    }

    if (!currentMember) {
      throw new Error('You are not a member of this workspace');
    }

    if (
      currentMember.role.name !== ROLES.WORKSPACE_ADMIN &&
      currentMember.role.name !== ROLES.WORKSPACE_MODERATOR
    ) {
      throw new Error('Only workspace admin or moderator can remove members');
    }

    if (!member) {
      throw new Error('Member not found in this workspace');
    }

    // Cannot remove yourself if you're the last admin
    if (member.userId === currentUserId) {
      const adminCount = await this.workspaceMemberRepository.count({
        where: { workspaceId },
        relations: ['role'],
      });

      if (adminCount <= 1) {
        throw new Error('Cannot remove the last admin from workspace');
      }
    }

    await this.workspaceMemberRepository.remove(member);

    return { message: 'Member removed successfully' };
  }
}
