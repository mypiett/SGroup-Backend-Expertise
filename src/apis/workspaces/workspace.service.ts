import { AppDataSource } from '../../config/data-source';
import { User } from '../users/user.entity';
import { createWorkspaceDto } from './workspace.dto';
import { Workspace } from './workspace.entity';

export class WorkspaceService {
  private workspaceRepository = AppDataSource.getRepository(Workspace);
  private userRepository = AppDataSource.getRepository(User);
  async createWorkspace(userId: number, data: createWorkspaceDto) {
    const owner = await this.userRepository.findOne({ where: { id: userId } });
    if (!owner) {
      throw new Error('User not found');
    }
    const newWorkspace = this.workspaceRepository.create(data);
    return await this.workspaceRepository.save(newWorkspace);
  }
}
