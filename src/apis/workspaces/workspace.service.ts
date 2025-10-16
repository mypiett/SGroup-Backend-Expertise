import { AppDataSource } from '../../config/data-source';
import { User } from '../../common/entities/user.entity';
import { createWorkspaceDto, UpdateWorkspaceDto } from './workspace.dto';
import { Workspace } from '../../common/entities/workspace.entity';

export class WorkspaceService {
  private workspaceRepository = AppDataSource.getRepository(Workspace);
  private userRepository = AppDataSource.getRepository(User);

  async createWorkspace(userId: number, data: createWorkspaceDto) {
    const owner = await this.userRepository.findOne({ where: { id: userId } });
    if (!owner) {
      throw new Error('User not found');
    }
    const newWorkspace = this.workspaceRepository.create({
      ...data,
      owner,
      isDeleted: false,
    });
    return await this.workspaceRepository.save(newWorkspace);
  }

  async getAllWorkspaces() {
    return await this.workspaceRepository.find({
      where: { isDeleted: false },
      relations: ['owner'],
    });
  }

  async getWorkspaceById(id: number) {
    const workspace = await this.workspaceRepository.findOne({
      where: { id, isDeleted: false },
      relations: ['owner', 'boards'],
    });
    if (!workspace) throw new Error('Workspace not found');
    return workspace;
  }

  async updateWorkspace(id: number, data: UpdateWorkspaceDto) {
    const workspace = await this.workspaceRepository.findOneBy({ id });
    if (!workspace) throw new Error('Workspace not found');

    Object.assign(workspace, data);
    return await this.workspaceRepository.save(workspace);
  }

  async deleteWorkspace(id: number) {
    const workspace = await this.workspaceRepository.findOneBy({ id });
    if (!workspace) throw new Error('Workspace not found');

    workspace.isDeleted = true;
    await this.workspaceRepository.save(workspace);
    return { message: 'Workspace deleted successfully' };
  }
}
