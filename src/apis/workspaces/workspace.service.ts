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
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new Error('User not found');
    }

    // Tìm role mặc định cho owner/admin của workspace
    const adminRole = await this.roleRepository.findOne({
      where: { name: ROLES.WORKSPACE_ADMIN },
    });
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
      where: { id },
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
    const workspaceMembers = await this.workspaceMemberRepository.find({
      where: { userId },
      relations: ['workspace', 'role'],
    });

    return workspaceMembers
      .filter((wm) => !wm.workspace.isArchived)
      .map((wm) => ({
        ...wm.workspace,
        role: wm.role,
      }));
  }

  // Archive workspace
  async archiveWorkspace(id: string, userId: string) {
    const workspace = await this.workspaceRepository.findOne({
      where: { id },
    });

    if (!workspace) {
      throw new Error('Workspace not found');
    }

    // Check if user is member and has admin role
    const member = await this.workspaceMemberRepository.findOne({
      where: { workspaceId: id, userId },
      relations: ['role'],
    });

    if (!member) {
      throw new Error('You are not a member of this workspace');
    }

    // Check if user has admin role
    if (
      member.role.name !== ROLES.WORKSPACE_ADMIN &&
      member.role.name !== ROLES.ADMIN
    ) {
      throw new Error('Only workspace admin can archive workspace');
    }

    workspace.isArchived = true;
    await this.workspaceRepository.save(workspace);

    return { message: 'Workspace archived successfully' };
  }

  // Reopen workspace
  async reopenWorkspace(id: string, userId: string) {
    const workspace = await this.workspaceRepository.findOne({
      where: { id },
    });

    if (!workspace) {
      throw new Error('Workspace not found');
    }

    // Check if user is member and has admin role
    const member = await this.workspaceMemberRepository.findOne({
      where: { workspaceId: id, userId },
      relations: ['role'],
    });

    if (!member) {
      throw new Error('You are not a member of this workspace');
    }

    // Check if user has admin role
    if (
      member.role.name !== ROLES.WORKSPACE_ADMIN &&
      member.role.name !== ROLES.ADMIN
    ) {
      throw new Error('Only workspace admin can reopen workspace');
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
    // Check workspace exists
    const workspace = await this.workspaceRepository.findOne({
      where: { id: workspaceId },
    });

    if (!workspace) {
      throw new Error('Workspace not found');
    }

    // Check current user is admin
    const currentMember = await this.workspaceMemberRepository.findOne({
      where: { workspaceId, userId: currentUserId },
      relations: ['role'],
    });

    if (!currentMember) {
      throw new Error('You are not a member of this workspace');
    }

    if (
      currentMember.role.name !== ROLES.WORKSPACE_ADMIN &&
      currentMember.role.name !== ROLES.ADMIN
    ) {
      throw new Error('Only workspace admin can add members');
    }

    // Check if user exists
    const user = await this.userRepository.findOne({
      where: { id: data.userId },
    });

    if (!user) {
      throw new Error('User not found');
    }

    // Check if user is already a member
    const existingMember = await this.workspaceMemberRepository.findOne({
      where: { workspaceId, userId: data.userId },
    });

    if (existingMember) {
      throw new Error('User is already a member of this workspace');
    }

    // Check if role exists
    const role = await this.roleRepository.findOne({
      where: { id: data.roleId },
    });

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
    // Check workspace exists
    const workspace = await this.workspaceRepository.findOne({
      where: { id: workspaceId },
    });

    if (!workspace) {
      throw new Error('Workspace not found');
    }

    // Check current user is admin
    const currentMember = await this.workspaceMemberRepository.findOne({
      where: { workspaceId, userId: currentUserId },
      relations: ['role'],
    });

    if (!currentMember) {
      throw new Error('You are not a member of this workspace');
    }

    if (
      currentMember.role.name !== ROLES.WORKSPACE_ADMIN &&
      currentMember.role.name !== ROLES.ADMIN
    ) {
      throw new Error('Only workspace admin can update member roles');
    }

    // Check if member exists
    const member = await this.workspaceMemberRepository.findOne({
      where: { id: memberId, workspaceId },
      relations: ['user', 'role'],
    });

    if (!member) {
      throw new Error('Member not found in this workspace');
    }

    // Check if new role exists
    const newRole = await this.roleRepository.findOne({
      where: { id: data.roleId },
    });

    if (!newRole) {
      throw new Error('Role not found');
    }

    // Update member role
    member.roleId = data.roleId;
    await this.workspaceMemberRepository.save(member);

    // Return updated member with relations
    const updatedMember = await this.workspaceMemberRepository.findOne({
      where: { id: memberId },
      relations: ['user', 'role', 'workspace'],
    });

    return {
      message: 'Member role updated successfully',
      member: updatedMember,
    };
  }

  // Get workspace members
  async getWorkspaceMembers(workspaceId: string) {
    const workspace = await this.workspaceRepository.findOne({
      where: { id: workspaceId },
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
    // Check workspace exists
    const workspace = await this.workspaceRepository.findOne({
      where: { id: workspaceId },
    });

    if (!workspace) {
      throw new Error('Workspace not found');
    }

    // Check current user is admin
    const currentMember = await this.workspaceMemberRepository.findOne({
      where: { workspaceId, userId: currentUserId },
      relations: ['role'],
    });

    if (!currentMember) {
      throw new Error('You are not a member of this workspace');
    }

    if (
      currentMember.role.name !== ROLES.WORKSPACE_ADMIN &&
      currentMember.role.name !== ROLES.ADMIN
    ) {
      throw new Error('Only workspace admin can remove members');
    }

    // Check if member exists
    const member = await this.workspaceMemberRepository.findOne({
      where: { id: memberId, workspaceId },
    });

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
