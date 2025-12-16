import { NextFunction, Request, Response } from 'express';
import { rbacProvider } from '@/common/utils/rbac';
import { Permission, PERMISSIONS } from '@/common/constants/permissions';
import { Role, ROLES } from '@/common/constants/roles';

// ============================================================================
// TYPES & HELPERS
// ============================================================================

type IdSource = 'params' | 'body' | 'query';

function getIdFromRequest(
  req: Request,
  idField: string,
  idSource: IdSource
): string | null {
  switch (idSource) {
    case 'params':
      return req.params[idField] || null;
    case 'body':
      return req.body[idField] || null;
    case 'query':
      return (req.query[idField] as string) || null;
    default:
      return null;
  }
}

function sendError(res: Response, status: number, message: string): Response {
  return res.status(status).json({ success: false, message });
}

export function checkWorkspaceAccess(
  idField: string = 'id',
  idSource: IdSource = 'params'
) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.userId || null;
      const workspaceId = getIdFromRequest(req, idField, idSource);

      if (!workspaceId) {
        return sendError(res, 400, `${idField} is required`);
      }

      const accessResult = await rbacProvider.canViewWorkspace(
        userId,
        workspaceId
      );

      if (!accessResult.allowed) {
        return sendError(res, 403, accessResult.reason || 'Access denied');
      }

      if (accessResult.userContext) {
        req.userContext = accessResult.userContext;
      }

      next();
    } catch (error) {
      console.error('Workspace access check error:', error);
      return sendError(res, 500, 'Access check failed');
    }
  };
}

export function checkBoardAccess(
  idField: string = 'id',
  idSource: IdSource = 'params',
  allowPublic: boolean = false
) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.userId || null;
      const boardId = getIdFromRequest(req, idField, idSource);

      if (!boardId) {
        return sendError(res, 400, `${idField} is required`);
      }

      const accessResult = await rbacProvider.canViewBoard(userId, boardId);

      if (!accessResult.allowed) {
        // Allow public access if configured
        if (allowPublic && accessResult.reason === 'Authentication required') {
          return next();
        }
        return sendError(res, 403, accessResult.reason || 'Access denied');
      }

      if (accessResult.userContext) {
        req.userContext = accessResult.userContext;
      }

      next();
    } catch (error) {
      console.error('Board access check error:', error);
      return sendError(res, 500, 'Access check failed');
    }
  };
}

export function checkListAccess(
  idField: string = 'id',
  idSource: IdSource = 'params'
) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.userId || null;
      const listId = getIdFromRequest(req, idField, idSource);

      if (!listId) {
        return sendError(res, 400, `${idField} is required`);
      }

      const boardId = await rbacProvider.getBoardIdFromList(listId);
      if (!boardId) {
        return sendError(res, 404, 'List not found');
      }

      const accessResult = await rbacProvider.canViewBoard(userId, boardId);

      if (!accessResult.allowed) {
        return sendError(res, 403, accessResult.reason || 'Access denied');
      }

      if (accessResult.userContext) {
        req.userContext = accessResult.userContext;
      }
      req.resolvedBoardId = boardId;

      next();
    } catch (error) {
      console.error('List access check error:', error);
      return sendError(res, 500, 'Access check failed');
    }
  };
}

export function checkCardAccess(
  idField: string = 'id',
  idSource: IdSource = 'params'
) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.userId || null;
      const cardId = getIdFromRequest(req, idField, idSource);

      if (!cardId) {
        return sendError(res, 400, `${idField} is required`);
      }

      const boardId = await rbacProvider.getBoardIdFromCard(cardId);
      if (!boardId) {
        return sendError(res, 404, 'Card not found');
      }

      const accessResult = await rbacProvider.canViewBoard(userId, boardId);

      if (!accessResult.allowed) {
        return sendError(res, 403, accessResult.reason || 'Access denied');
      }

      if (accessResult.userContext) {
        req.userContext = accessResult.userContext;
      }
      req.resolvedBoardId = boardId;

      next();
    } catch (error) {
      console.error('Card access check error:', error);
      return sendError(res, 500, 'Access check failed');
    }
  };
}

export function requireWorkspaceRoles(
  allowedRoles: Role[],
  idField: string = 'id',
  idSource: IdSource = 'params'
) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        return sendError(res, 401, 'Authentication required');
      }

      const workspaceId = getIdFromRequest(req, idField, idSource);
      if (!workspaceId) {
        return sendError(res, 400, `${idField} is required`);
      }

      const membership = await rbacProvider.getWorkspaceMembership(
        userId,
        workspaceId
      );
      if (!membership) {
        return sendError(res, 403, 'Not a workspace member');
      }

      if (!allowedRoles.includes(membership.role)) {
        return sendError(res, 403, 'Insufficient role privileges');
      }

      req.userContext = {
        userId,
        workspaceRole: membership.role,
        isWorkspaceMember: true,
        isBoardMember: false,
      };

      next();
    } catch (error) {
      console.error('Workspace role check error:', error);
      return sendError(res, 500, 'Role check failed');
    }
  };
}

export function requireBoardRoles(
  allowedRoles: Role[],
  idField: string = 'id',
  idSource: IdSource = 'params'
) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        return sendError(res, 401, 'Authentication required');
      }

      const boardId = getIdFromRequest(req, idField, idSource);
      if (!boardId) {
        return sendError(res, 400, `${idField} is required`);
      }

      const effectiveRole = await rbacProvider.getEffectiveBoardRole(
        userId,
        boardId
      );
      if (!effectiveRole) {
        return sendError(res, 403, 'Not authorized to access this board');
      }

      if (!allowedRoles.includes(effectiveRole)) {
        return sendError(res, 403, 'Insufficient role privileges');
      }

      const boardMembership = await rbacProvider.getBoardMembership(
        userId,
        boardId
      );

      req.userContext = {
        userId,
        boardRole: boardMembership?.role || effectiveRole,
        isWorkspaceMember: effectiveRole !== boardMembership?.role,
        isBoardMember: !!boardMembership,
      };

      next();
    } catch (error) {
      console.error('Board role check error:', error);
      return sendError(res, 500, 'Role check failed');
    }
  };
}

export function requireListRoles(
  allowedRoles: Role[],
  idField: string = 'id',
  idSource: IdSource = 'params'
) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        return sendError(res, 401, 'Authentication required');
      }

      const listId = getIdFromRequest(req, idField, idSource);
      if (!listId) {
        return sendError(res, 400, `${idField} is required`);
      }

      const boardId = await rbacProvider.getBoardIdFromList(listId);
      if (!boardId) {
        return sendError(res, 404, 'List not found');
      }

      const effectiveRole = await rbacProvider.getEffectiveBoardRole(
        userId,
        boardId
      );
      if (!effectiveRole) {
        return sendError(res, 403, 'Not authorized to access this list');
      }

      if (!allowedRoles.includes(effectiveRole)) {
        return sendError(res, 403, 'Insufficient role privileges');
      }

      const boardMembership = await rbacProvider.getBoardMembership(
        userId,
        boardId
      );

      req.userContext = {
        userId,
        boardRole: boardMembership?.role || effectiveRole,
        isWorkspaceMember: effectiveRole !== boardMembership?.role,
        isBoardMember: !!boardMembership,
      };
      req.resolvedBoardId = boardId;

      next();
    } catch (error) {
      console.error('List role check error:', error);
      return sendError(res, 500, 'Role check failed');
    }
  };
}

export function requireCardRoles(
  allowedRoles: Role[],
  idField: string = 'id',
  idSource: IdSource = 'params'
) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        return sendError(res, 401, 'Authentication required');
      }

      const cardId = getIdFromRequest(req, idField, idSource);
      if (!cardId) {
        return sendError(res, 400, `${idField} is required`);
      }

      const boardId = await rbacProvider.getBoardIdFromCard(cardId);
      if (!boardId) {
        return sendError(res, 404, 'Card not found');
      }

      const effectiveRole = await rbacProvider.getEffectiveBoardRole(
        userId,
        boardId
      );
      if (!effectiveRole) {
        return sendError(res, 403, 'Not authorized to access this card');
      }

      if (!allowedRoles.includes(effectiveRole)) {
        return sendError(res, 403, 'Insufficient role privileges');
      }

      const boardMembership = await rbacProvider.getBoardMembership(
        userId,
        boardId
      );

      req.userContext = {
        userId,
        boardRole: boardMembership?.role || effectiveRole,
        isWorkspaceMember: effectiveRole !== boardMembership?.role,
        isBoardMember: !!boardMembership,
      };
      req.resolvedBoardId = boardId;

      next();
    } catch (error) {
      console.error('Card role check error:', error);
      return sendError(res, 500, 'Role check failed');
    }
  };
}

export function requireWorkspacePermission(
  permission: Permission,
  idField: string = 'id',
  idSource: IdSource = 'params'
) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        return sendError(res, 401, 'Authentication required');
      }

      const workspaceId = getIdFromRequest(req, idField, idSource);
      if (!workspaceId) {
        return sendError(res, 400, `${idField} is required`);
      }

      const hasPermission = await rbacProvider.hasWorkspacePermission(
        userId,
        workspaceId,
        permission
      );

      if (!hasPermission) {
        return sendError(res, 403, 'Insufficient permissions');
      }

      // Attach user context
      const membership = await rbacProvider.getWorkspaceMembership(
        userId,
        workspaceId
      );
      req.userContext = {
        userId,
        workspaceRole: membership?.role,
        isWorkspaceMember: !!membership,
        isBoardMember: false,
      };

      next();
    } catch (error) {
      console.error('Workspace permission check error:', error);
      return sendError(res, 500, 'Permission check failed');
    }
  };
}

export function requireBoardPermission(
  permission: Permission,
  idField: string = 'id',
  idSource: IdSource = 'params'
) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        return sendError(res, 401, 'Authentication required');
      }

      const boardId = getIdFromRequest(req, idField, idSource);
      if (!boardId) {
        return sendError(res, 400, `${idField} is required`);
      }

      const hasPermission = await rbacProvider.hasBoardPermission(
        userId,
        boardId,
        permission
      );

      if (!hasPermission) {
        return sendError(res, 403, 'Insufficient permissions');
      }

      // Attach user context
      const [effectiveRole, boardMembership] = await Promise.all([
        rbacProvider.getEffectiveBoardRole(userId, boardId),
        rbacProvider.getBoardMembership(userId, boardId),
      ]);

      req.userContext = {
        userId,
        boardRole: boardMembership?.role || effectiveRole || undefined,
        isWorkspaceMember: effectiveRole !== boardMembership?.role,
        isBoardMember: !!boardMembership,
      };

      next();
    } catch (error) {
      console.error('Board permission check error:', error);
      return sendError(res, 500, 'Permission check failed');
    }
  };
}

export function requireListPermission(
  permission: Permission,
  idField: string = 'id',
  idSource: IdSource = 'params'
) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        return sendError(res, 401, 'Authentication required');
      }

      const listId = getIdFromRequest(req, idField, idSource);
      if (!listId) {
        return sendError(res, 400, `${idField} is required`);
      }

      const boardId = await rbacProvider.getBoardIdFromList(listId);
      if (!boardId) {
        return sendError(res, 404, 'List not found');
      }

      const hasPermission = await rbacProvider.hasBoardPermission(
        userId,
        boardId,
        permission
      );

      if (!hasPermission) {
        return sendError(res, 403, 'Insufficient permissions');
      }

      // Attach user context
      const [effectiveRole, boardMembership] = await Promise.all([
        rbacProvider.getEffectiveBoardRole(userId, boardId),
        rbacProvider.getBoardMembership(userId, boardId),
      ]);

      req.userContext = {
        userId,
        boardRole: boardMembership?.role || effectiveRole || undefined,
        isWorkspaceMember: effectiveRole !== boardMembership?.role,
        isBoardMember: !!boardMembership,
      };
      req.resolvedBoardId = boardId;

      next();
    } catch (error) {
      console.error('List permission check error:', error);
      return sendError(res, 500, 'Permission check failed');
    }
  };
}

export function requireCardPermission(
  permission: Permission,
  idField: string = 'id',
  idSource: IdSource = 'params'
) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        return sendError(res, 401, 'Authentication required');
      }

      const cardId = getIdFromRequest(req, idField, idSource);
      if (!cardId) {
        return sendError(res, 400, `${idField} is required`);
      }

      const boardId = await rbacProvider.getBoardIdFromCard(cardId);
      if (!boardId) {
        return sendError(res, 404, 'Card not found');
      }

      const hasPermission = await rbacProvider.hasBoardPermission(
        userId,
        boardId,
        permission
      );

      if (!hasPermission) {
        return sendError(res, 403, 'Insufficient permissions');
      }

      // Attach user context
      const [effectiveRole, boardMembership] = await Promise.all([
        rbacProvider.getEffectiveBoardRole(userId, boardId),
        rbacProvider.getBoardMembership(userId, boardId),
      ]);

      req.userContext = {
        userId,
        boardRole: boardMembership?.role || effectiveRole || undefined,
        isWorkspaceMember: effectiveRole !== boardMembership?.role,
        isBoardMember: !!boardMembership,
      };
      req.resolvedBoardId = boardId;

      next();
    } catch (error) {
      console.error('Card permission check error:', error);
      return sendError(res, 500, 'Permission check failed');
    }
  };
}

export const requireBoardMember = (
  idField = 'id',
  idSource: IdSource = 'params'
) =>
  requireBoardRoles(
    [
      ROLES.BOARD_OWNER,
      ROLES.BOARD_ADMIN,
      ROLES.BOARD_MEMBER,
      ROLES.WORKSPACE_ADMIN,
      ROLES.WORKSPACE_MODERATOR,
      ROLES.WORKSPACE_MEMBER,
    ],
    idField,
    idSource
  );

export const requireBoardAdmin = (
  idField = 'id',
  idSource: IdSource = 'params'
) =>
  requireBoardRoles(
    [
      ROLES.BOARD_OWNER,
      ROLES.BOARD_ADMIN,
      ROLES.WORKSPACE_ADMIN,
      ROLES.WORKSPACE_MODERATOR,
    ],
    idField,
    idSource
  );

export const requireBoardOwner = (
  idField = 'id',
  idSource: IdSource = 'params'
) =>
  requireBoardRoles(
    [ROLES.BOARD_OWNER, ROLES.WORKSPACE_ADMIN],
    idField,
    idSource
  );

export const requireWorkspaceAdmin = (
  idField = 'id',
  idSource: IdSource = 'params'
) =>
  requireWorkspaceRoles(
    [ROLES.WORKSPACE_ADMIN, ROLES.ADMIN],
    idField,
    idSource
  );

export const requireWorkspaceModerator = (
  idField = 'id',
  idSource: IdSource = 'params'
) =>
  requireWorkspaceRoles(
    [ROLES.WORKSPACE_ADMIN, ROLES.WORKSPACE_MODERATOR, ROLES.ADMIN],
    idField,
    idSource
  );

export const requireWorkspaceMember = (
  idField = 'id',
  idSource: IdSource = 'params'
) =>
  requireWorkspaceRoles(
    [
      ROLES.WORKSPACE_ADMIN,
      ROLES.WORKSPACE_MODERATOR,
      ROLES.WORKSPACE_MEMBER,
      ROLES.WORKSPACE_OBSERVER,
    ],
    idField,
    idSource
  );

export const requireListMember = (
  idField = 'id',
  idSource: IdSource = 'params'
) =>
  requireListRoles(
    [
      ROLES.BOARD_OWNER,
      ROLES.BOARD_ADMIN,
      ROLES.BOARD_MEMBER,
      ROLES.WORKSPACE_ADMIN,
      ROLES.WORKSPACE_MODERATOR,
      ROLES.WORKSPACE_MEMBER,
    ],
    idField,
    idSource
  );

export const requireListAdmin = (
  idField = 'id',
  idSource: IdSource = 'params'
) =>
  requireListRoles(
    [
      ROLES.BOARD_OWNER,
      ROLES.BOARD_ADMIN,
      ROLES.WORKSPACE_ADMIN,
      ROLES.WORKSPACE_MODERATOR,
    ],
    idField,
    idSource
  );

export const requireCardMember = (
  idField = 'id',
  idSource: IdSource = 'params'
) =>
  requireCardRoles(
    [
      ROLES.BOARD_OWNER,
      ROLES.BOARD_ADMIN,
      ROLES.BOARD_MEMBER,
      ROLES.WORKSPACE_ADMIN,
      ROLES.WORKSPACE_MODERATOR,
      ROLES.WORKSPACE_MEMBER,
    ],
    idField,
    idSource
  );

export const requireCardAdmin = (
  idField = 'id',
  idSource: IdSource = 'params'
) =>
  requireCardRoles(
    [
      ROLES.BOARD_OWNER,
      ROLES.BOARD_ADMIN,
      ROLES.WORKSPACE_ADMIN,
      ROLES.WORKSPACE_MODERATOR,
    ],
    idField,
    idSource
  );

export { PERMISSIONS, ROLES };
