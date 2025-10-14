import { Request, Response } from 'express';
import { WorkspaceService } from './workspace.service';
import { createWorkspaceDto, UpdateWorkspaceDto } from './workspace.dto';

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

  static async getAllWorkspaces(req: Request, res: Response) {
    try {
      const workspaces = await workspaceService.getAllWorkspaces();
      return res.status(200).json(workspaces);
    } catch (error) {
      return res.status(400).json({ message: error.message });
    }
  }

  static async getWorkspaceById(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      const workspace = await workspaceService.getWorkspaceById(id);
      return res.status(200).json(workspace);
    } catch (error) {
      return res.status(404).json({ message: error.message });
    }
  }

  static async updateWorkspace(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      const data: UpdateWorkspaceDto = req.body;

      const updated = await workspaceService.updateWorkspace(id, data);
      return res.status(200).json(updated);
    } catch (error) {
      return res.status(400).json({ message: error.message });
    }
  }

  static async deleteWorkspace(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      const result = await workspaceService.deleteWorkspace(id);
      return res.status(200).json(result);
    } catch (error) {
      return res.status(400).json({ message: error.message });
    }
  }
}
