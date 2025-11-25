import { NextFunction, Request, Response } from 'express';
import { RbacProvider } from '@/common/utils/rbac';

interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    roles?: string[];
    permissions?: string[];
    [key: string]: any;
  };
}

// Chuẩn hóa danh sách (lowercase + trim)
function normalize(list?: string[]) {
  return (list ?? []).map((x) => x.toLowerCase().trim());
}

// Middleware kiểm tra permissions trong workspace
export function requireWorkspacePermissions(
  required: string[] | string,
  options?: { any?: boolean }
) {
  const requiredList = normalize(
    Array.isArray(required) ? required : [required]
  );
  const matchAny = options?.any === true;

  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authReq = req as AuthenticatedRequest;
      if (!authReq.user)
        return res.status(401).json({ message: 'Unauthorized' });

      const userId = authReq.user.userId;
      const workspaceId =
        (req.params as any).workspaceId ||
        req.params.id ||
        (req.body as any).workspaceId ||
        req.body.id ||
        (req.query as any).workspaceId;

      if (!workspaceId) {
        return res.status(400).json({ message: 'Workspace ID required' });
      }

      const permissions = await RbacProvider.getUserPermissionsInWorkspace(
        userId,
        workspaceId
      );

      console.log('🚀 ~ Workspace Permissions:', permissions);

      const userPerms = new Set(normalize(permissions));
      const matches = requiredList.map((p) => userPerms.has(p));
      const ok = matchAny ? matches.some(Boolean) : matches.every(Boolean);

      if (!ok) {
        return res.status(403).json({
          message: 'Forbidden: Insufficient workspace permissions',
          required: requiredList,
          userPermissions: Array.from(userPerms),
        });
      }

      next();
    } catch (err) {
      next(err);
    }
  };
}

// Middleware kiểm tra permissions trong board
export function requireBoardPermissions(
  required: string[] | string,
  options?: { any?: boolean }
) {
  const requiredList = normalize(
    Array.isArray(required) ? required : [required]
  );
  const matchAny = options?.any === true;

  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authReq = req as AuthenticatedRequest;
      if (!authReq.user)
        return res.status(401).json({ message: 'Unauthorized' });

      const userId = authReq.user.userId;
      const boardId =
        (req.params as any).boardId ||
        req.params.id ||
        (req.body as any).boardId ||
        (req.query as any).boardId;

      if (!boardId) {
        return res.status(400).json({ message: 'Board ID required' });
      }

      const permissions = await RbacProvider.getUserPermissionsInBoard(
        userId,
        boardId
      );

      console.log('🚀 ~ Board Permissions:', permissions);

      const userPerms = new Set(normalize(permissions));
      const matches = requiredList.map((p) => userPerms.has(p));
      const ok = matchAny ? matches.some(Boolean) : matches.every(Boolean);

      if (!ok) {
        return res.status(403).json({
          message: 'Forbidden: Insufficient board permissions',
          required: requiredList,
          userPermissions: Array.from(userPerms),
        });
      }

      next();
    } catch (err) {
      next(err);
    }
  };
}

// Middleware kiểm tra permissions trong card
export function requireCardPermissions(
  required: string[] | string,
  options?: { any?: boolean }
) {
  const requiredList = normalize(
    Array.isArray(required) ? required : [required]
  );
  const matchAny = options?.any === true;

  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authReq = req as AuthenticatedRequest;
      if (!authReq.user)
        return res.status(401).json({ message: 'Unauthorized' });

      const userId = authReq.user.userId;
      const cardId = req.params.cardId || req.body.cardId;

      if (!cardId) {
        return res.status(400).json({ message: 'Card ID required' });
      }

      const permissions = await RbacProvider.getUserPermissionsInCard(
        userId,
        cardId
      );

      console.log('🚀 ~ Card Permissions:', permissions);

      const userPerms = new Set(normalize(permissions));
      const matches = requiredList.map((p) => userPerms.has(p));
      const ok = matchAny ? matches.some(Boolean) : matches.every(Boolean);

      if (!ok) {
        return res.status(403).json({
          message: 'Forbidden: Insufficient card permissions',
          required: requiredList,
          userPermissions: Array.from(userPerms),
        });
      }

      next();
    } catch (err) {
      next(err);
    }
  };
}

// Middleware kiểm tra workspace roles
export function requireWorkspaceRoles(
  required: string[] | string,
  options?: { any?: boolean }
) {
  const requiredList = normalize(
    Array.isArray(required) ? required : [required]
  );
  const matchAny = options?.any === true;

  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authReq = req as AuthenticatedRequest;
      if (!authReq.user)
        return res.status(401).json({ message: 'Unauthorized' });

      const userId = authReq.user.userId;
      const workspaceId = req.params.workspaceId || req.body.workspaceId;

      if (!workspaceId) {
        return res.status(400).json({ message: 'Workspace ID required' });
      }

      const roles = await RbacProvider.getUserRolesInWorkspace(
        userId,
        workspaceId
      );

      console.log('🚀 ~ Workspace Roles:', roles);

      const userRoles = new Set(normalize(roles));
      const matches = requiredList.map((r) => userRoles.has(r));
      const ok = matchAny ? matches.some(Boolean) : matches.every(Boolean);

      if (!ok) {
        return res.status(403).json({
          message: 'Forbidden: Insufficient workspace role',
          required: requiredList,
          userRoles: Array.from(userRoles),
        });
      }

      next();
    } catch (err) {
      next(err);
    }
  };
}

// Middleware load tất cả roles/permissions (cho general purpose)
export async function preloadUserAuthz(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const authReq = req as AuthenticatedRequest;
    if (!authReq.user) return res.status(401).json({ message: 'Unauthorized' });

    const userId = authReq.user.userId;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    // Load tất cả roles và permissions từ mọi context
    if (!authReq.user.roles || !authReq.user.permissions) {
      const { roles, permissions } = await RbacProvider.attachUserAuthz(userId);
      authReq.user.roles = roles;
      authReq.user.permissions = permissions;
    }
    next();
  } catch (err) {
    next(err);
  }
}
