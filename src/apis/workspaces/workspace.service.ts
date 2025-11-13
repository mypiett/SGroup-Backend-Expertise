import { AppDataSource } from '../../config/data-source';
import { User } from '../../common/entities/user.entity';
import { createWorkspaceDto, UpdateWorkspaceDto } from './workspace.dto';
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
}
