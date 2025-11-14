import { Request, Response } from 'express';
import { WorkspaceService } from './workspace.service';
import {
  createWorkspaceDto,
  UpdateWorkspaceDto,
  AddMemberDto,
  UpdateMemberRoleDto,
} from './workspace.dto';

const workspaceService = new WorkspaceService();
export class WorkspaceController {
  static async createWorkspace(req: Request, res: Response) {
    const userId = (req as any).user?.id;
    const data: createWorkspaceDto = req.body;
    if (!data.title || data.title.trim() === '') {
      throw new Error('Workspace title is required');
    }
    try {
      const result = await workspaceService.createWorkspace(userId, data);
      return res.status(201).json(result);
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
      const id = req.params.id;
      const workspace = await workspaceService.getWorkspaceById(id);
      return res.status(200).json(workspace);
    } catch (error) {
      return res.status(404).json({ message: error.message });
    }
  }

  static async updateWorkspace(req: Request, res: Response) {
    try {
      const id = req.params.id;
      const data: UpdateWorkspaceDto = req.body;

      const updated = await workspaceService.updateWorkspace(id, data);
      return res.status(200).json(updated);
    } catch (error) {
      return res.status(400).json({ message: error.message });
    }
  }

  static async deleteWorkspace(req: Request, res: Response) {
    try {
      const id = req.params.id;
      const result = await workspaceService.deleteWorkspace(id);
      return res.status(200).json(result);
    } catch (error) {
      return res.status(400).json({ message: error.message });
    }
  }

  static async getUserWorkspaces(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;
      const workspaces = await workspaceService.getWorkspacesByUserId(userId);
      return res.status(200).json(workspaces);
    } catch (error) {
      return res.status(400).json({ message: error.message });
    }
  }

  // Archive workspace
  static async archiveWorkspace(req: Request, res: Response) {
    try {
      const id = req.params.id;
      const userId = (req as any).user?.id;
      const result = await workspaceService.archiveWorkspace(id, userId);
      return res.status(200).json(result);
    } catch (error) {
      if (error.message === 'Workspace not found') {
        return res.status(404).json({ message: error.message });
      }
      if (
        error.message.includes('not a member') ||
        error.message.includes('Only workspace admin')
      ) {
        return res.status(403).json({ message: error.message });
      }
      return res.status(400).json({ message: error.message });
    }
  }

  // Reopen workspace
  static async reopenWorkspace(req: Request, res: Response) {
    try {
      const id = req.params.id;
      const userId = (req as any).user?.id;
      const result = await workspaceService.reopenWorkspace(id, userId);
      return res.status(200).json(result);
    } catch (error) {
      if (error.message === 'Workspace not found') {
        return res.status(404).json({ message: error.message });
      }
      if (
        error.message.includes('not a member') ||
        error.message.includes('Only workspace admin')
      ) {
        return res.status(403).json({ message: error.message });
      }
      return res.status(400).json({ message: error.message });
    }
  }

  // Add member to workspace
  static async addMember(req: Request, res: Response) {
    try {
      const workspaceId = req.params.id;
      const currentUserId = (req as any).user?.id;
      const data: AddMemberDto = req.body;

      const result = await workspaceService.addMember(
        workspaceId,
        data,
        currentUserId
      );
      return res.status(201).json(result);
    } catch (error) {
      if (
        error.message === 'Workspace not found' ||
        error.message === 'User not found' ||
        error.message === 'Role not found'
      ) {
        return res.status(404).json({ message: error.message });
      }
      if (
        error.message.includes('not a member') ||
        error.message.includes('Only workspace admin') ||
        error.message.includes('already a member')
      ) {
        return res.status(403).json({ message: error.message });
      }
      return res.status(400).json({ message: error.message });
    }
  }

  // Update member role
  static async updateMemberRole(req: Request, res: Response) {
    try {
      const workspaceId = req.params.id;
      const memberId = req.params.memberId;
      const currentUserId = (req as any).user?.id;
      const data: UpdateMemberRoleDto = req.body;

      const result = await workspaceService.updateMemberRole(
        workspaceId,
        memberId,
        data,
        currentUserId
      );
      return res.status(200).json(result);
    } catch (error) {
      if (
        error.message === 'Workspace not found' ||
        error.message === 'Member not found in this workspace' ||
        error.message === 'Role not found'
      ) {
        return res.status(404).json({ message: error.message });
      }
      if (
        error.message.includes('not a member') ||
        error.message.includes('Only workspace admin')
      ) {
        return res.status(403).json({ message: error.message });
      }
      return res.status(400).json({ message: error.message });
    }
  }

  // Get workspace members
  static async getWorkspaceMembers(req: Request, res: Response) {
    try {
      const workspaceId = req.params.id;
      const members = await workspaceService.getWorkspaceMembers(workspaceId);
      return res.status(200).json(members);
    } catch (error) {
      if (error.message === 'Workspace not found') {
        return res.status(404).json({ message: error.message });
      }
      return res.status(400).json({ message: error.message });
    }
  }

  // Remove member
  static async removeMember(req: Request, res: Response) {
    try {
      const workspaceId = req.params.id;
      const memberId = req.params.memberId;
      const currentUserId = (req as any).user?.id;

      const result = await workspaceService.removeMember(
        workspaceId,
        memberId,
        currentUserId
      );
      return res.status(200).json(result);
    } catch (error) {
      if (
        error.message === 'Workspace not found' ||
        error.message === 'Member not found in this workspace'
      ) {
        return res.status(404).json({ message: error.message });
      }
      if (
        error.message.includes('not a member') ||
        error.message.includes('Only workspace admin') ||
        error.message.includes('Cannot remove the last admin')
      ) {
        return res.status(403).json({ message: error.message });
      }
      return res.status(400).json({ message: error.message });
    }
  }
}
