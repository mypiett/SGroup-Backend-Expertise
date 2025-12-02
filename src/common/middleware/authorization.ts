import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { RbacProvider } from '@/common/utils/rbac';
import {
  ResponseStatus,
  ServiceResponse,
} from '@/common/models/serviceResponse';
import { handleServiceResponse } from '@/common/utils/httpHandlers';

interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    email: string;
    roles?: string[];
    permissions?: string[];
    [key: string]: any;
  };
  boardAccess?: {
    visibility: 'public' | 'private' | 'workspace';
    hasAccess: boolean;
    accessLevel:
      | 'public'
      | 'guest'
      | 'board-member'
      | 'workspace-member'
      | 'none';
    isBoardMember: boolean;
    isWorkspaceMember: boolean;
    boardRole?: string;
    workspaceRole?: string;
    effectiveRole?: string;
  };
}

// Chuẩn hóa danh sách (lowercase + trim + remove extra spaces)
function normalize(list?: string[]) {
  return (list ?? []).map((x) => x.toLowerCase().trim().replace(/\s+/g, ' '));
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
      if (!authReq.user) {
        const serviceResponse = new ServiceResponse(
          ResponseStatus.Failed,
          'Unauthorized',
          null,
          StatusCodes.UNAUTHORIZED
        );
        return handleServiceResponse(serviceResponse, res);
      }

      const userId = authReq.user.userId;
      const workspaceId =
        (req.params as any).workspaceId ||
        req.params.id ||
        req.body.workspaceId ||
        req.body.id ||
        (req.query as any).workspaceId;

      if (!workspaceId) {
        const serviceResponse = new ServiceResponse(
          ResponseStatus.Failed,
          'Workspace ID required',
          null,
          StatusCodes.BAD_REQUEST
        );
        return handleServiceResponse(serviceResponse, res);
      }

      const permissions = await RbacProvider.getUserPermissionsInWorkspace(
        userId,
        workspaceId
      );

      console.log('Workspace Permissions:', permissions);

      const userPerms = new Set(normalize(permissions));
      const matches = requiredList.map((p) => userPerms.has(p));
      const ok = matchAny ? matches.some(Boolean) : matches.every(Boolean);

      if (!ok) {
        const serviceResponse = new ServiceResponse(
          ResponseStatus.Failed,
          'Forbidden: Insufficient workspace permissions',
          {
            required: requiredList,
            userPermissions: Array.from(userPerms),
          },
          StatusCodes.FORBIDDEN
        );
        return handleServiceResponse(serviceResponse, res);
      }

      next();
    } catch (err) {
      next(err);
    }
  };
}

export function checkBoardAccess() {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authReq = req as AuthenticatedRequest;
      if (!authReq.user) {
        const serviceResponse = new ServiceResponse(
          ResponseStatus.Failed,
          'Unauthorized',
          null,
          StatusCodes.UNAUTHORIZED
        );
        return handleServiceResponse(serviceResponse, res);
      }

      const userId = authReq.user.userId;
      const boardId =
        (req.params as any).boardId ||
        req.params.id ||
        req.body.boardId ||
        (req.query as any).boardId;

      if (!boardId) {
        const serviceResponse = new ServiceResponse(
          ResponseStatus.Failed,
          'Board ID required',
          null,
          StatusCodes.BAD_REQUEST
        );
        return handleServiceResponse(serviceResponse, res);
      }

      // Lấy thông tin access với 4-layer strategy
      const accessInfo = await RbacProvider.checkBoardAccess(userId, boardId);

      console.log('Board Access Info:', {
        boardId,
        userId,
        accessLevel: accessInfo.accessLevel,
        effectiveRole: accessInfo.effectiveRole,
        visibility: accessInfo.visibility,
      });

      // Kiểm tra quyền truy cập
      if (!accessInfo.hasAccess) {
        const serviceResponse = new ServiceResponse(
          ResponseStatus.Failed,
          `Access denied. This is a ${accessInfo.visibility} board and you don't have access.`,
          {
            visibility: accessInfo.visibility,
            accessLevel: accessInfo.accessLevel,
          },
          StatusCodes.FORBIDDEN
        );
        return handleServiceResponse(serviceResponse, res);
      }

      // Lưu thông tin để các middleware sau sử dụng
      authReq.boardAccess = accessInfo;

      next();
    } catch (err) {
      next(err);
    }
  };
}

export function requireBoardPermissions(
  required: string[] | string,
  options?: { any?: boolean; skipForPublicRead?: boolean }
) {
  const requiredList = normalize(
    Array.isArray(required) ? required : [required]
  );
  const matchAny = options?.any === true;
  const skipForPublicRead = options?.skipForPublicRead === true;

  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authReq = req as AuthenticatedRequest;
      if (!authReq.user) {
        const serviceResponse = new ServiceResponse(
          ResponseStatus.Failed,
          'Unauthorized',
          null,
          StatusCodes.UNAUTHORIZED
        );
        return handleServiceResponse(serviceResponse, res);
      }

      const userId = authReq.user.userId;
      const boardId =
        (req.params as any).boardId ||
        req.params.id ||
        req.body.boardId ||
        (req.query as any).boardId;

      if (!boardId) {
        const serviceResponse = new ServiceResponse(
          ResponseStatus.Failed,
          'Board ID required',
          null,
          StatusCodes.BAD_REQUEST
        );
        return handleServiceResponse(serviceResponse, res);
      }

      // Nếu có boardAccess từ checkBoardAccess và thỏa điều kiện skip
      if (skipForPublicRead && authReq.boardAccess) {
        const { accessLevel } = authReq.boardAccess;
        const isReadOnly = requiredList.every((p) => p.includes('read'));

        if (accessLevel === 'public' && isReadOnly) {
          // Public board + chỉ đọc => cho phép
          return next();
        }
      }

      // Lấy permissions của user trong board (đã bao gồm inherited permissions)
      const permissions = await RbacProvider.getUserPermissionsInBoard(
        userId,
        boardId
      );

      console.log('Board Permissions:', {
        boardId,
        userId,
        required: requiredList,
        userPermissions: permissions,
        accessLevel: authReq.boardAccess?.accessLevel,
      });

      const userPerms = new Set(normalize(permissions));
      const matches = requiredList.map((p) => userPerms.has(p));
      const ok = matchAny ? matches.some(Boolean) : matches.every(Boolean);

      if (!ok) {
        const serviceResponse = new ServiceResponse(
          ResponseStatus.Failed,
          'Forbidden: Insufficient board permissions',
          {
            required: requiredList,
            userPermissions: Array.from(userPerms),
          },
          StatusCodes.FORBIDDEN
        );
        return handleServiceResponse(serviceResponse, res);
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
      if (!authReq.user) {
        const serviceResponse = new ServiceResponse(
          ResponseStatus.Failed,
          'Unauthorized',
          null,
          StatusCodes.UNAUTHORIZED
        );
        return handleServiceResponse(serviceResponse, res);
      }

      const userId = authReq.user.userId;
      const cardId = req.params.cardId || req.body.cardId;

      if (!cardId) {
        const serviceResponse = new ServiceResponse(
          ResponseStatus.Failed,
          'Card ID required',
          null,
          StatusCodes.BAD_REQUEST
        );
        return handleServiceResponse(serviceResponse, res);
      }

      const permissions = await RbacProvider.getUserPermissionsInCard(
        userId,
        cardId
      );

      console.log('Card Permissions:', permissions);

      const userPerms = new Set(normalize(permissions));
      const matches = requiredList.map((p) => userPerms.has(p));
      const ok = matchAny ? matches.some(Boolean) : matches.every(Boolean);

      if (!ok) {
        const serviceResponse = new ServiceResponse(
          ResponseStatus.Failed,
          'Forbidden: Insufficient card permissions',
          {
            required: requiredList,
            userPermissions: Array.from(userPerms),
          },
          StatusCodes.FORBIDDEN
        );
        return handleServiceResponse(serviceResponse, res);
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
  // Default là any = true khi có nhiều roles (user chỉ cần 1 trong các roles)
  const matchAny = options?.any ?? requiredList.length > 1;

  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authReq = req as AuthenticatedRequest;
      if (!authReq.user) {
        const serviceResponse = new ServiceResponse(
          ResponseStatus.Failed,
          'Unauthorized',
          null,
          StatusCodes.UNAUTHORIZED
        );
        return handleServiceResponse(serviceResponse, res);
      }

      const userId = authReq.user.userId;
      const workspaceId = req.params.workspaceId || req.body.workspaceId;

      if (!workspaceId) {
        const serviceResponse = new ServiceResponse(
          ResponseStatus.Failed,
          'Workspace ID required',
          null,
          StatusCodes.BAD_REQUEST
        );
        return handleServiceResponse(serviceResponse, res);
      }

      const roles = await RbacProvider.getUserRolesInWorkspace(
        userId,
        workspaceId
      );

      console.log('Workspace Roles:', roles);

      const userRoles = new Set(normalize(roles));
      const matches = requiredList.map((r) => userRoles.has(r));
      const ok = matchAny ? matches.some(Boolean) : matches.every(Boolean);

      if (!ok) {
        const serviceResponse = new ServiceResponse(
          ResponseStatus.Failed,
          'Forbidden: Insufficient workspace role',
          {
            required: requiredList,
            userRoles: Array.from(userRoles),
          },
          StatusCodes.FORBIDDEN
        );
        return handleServiceResponse(serviceResponse, res);
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
    if (!authReq.user) {
      const serviceResponse = new ServiceResponse(
        ResponseStatus.Failed,
        'Unauthorized',
        null,
        StatusCodes.UNAUTHORIZED
      );
      return handleServiceResponse(serviceResponse, res);
    }

    const userId = authReq.user.userId;
    if (!userId) {
      const serviceResponse = new ServiceResponse(
        ResponseStatus.Failed,
        'Unauthorized',
        null,
        StatusCodes.UNAUTHORIZED
      );
      return handleServiceResponse(serviceResponse, res);
    }

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
