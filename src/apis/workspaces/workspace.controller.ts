import { Request, Response } from 'express';
import { WorkspaceService } from './workspace.service';
import { createWorkspaceDto } from './workspace.dto';

const workspaceService = new WorkspaceService();
export class WorkspaceController {
  static async createWorkspace(req: Request, res: Response) {
    const userId = Number((req as any).user?.id);
    const data: createWorkspaceDto = req.body;
    if (!data.name || data.name.trim() === '') {
      throw new Error('Workspace name is required');
    }
    try {
      const result = await workspaceService.createWorkspace(userId, data);
      return res.status(200).json(result);
    } catch (error) {
      return res.status(400).json({ message: error.message });
    }
  }
}
