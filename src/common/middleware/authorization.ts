import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { rbacProvider, RbacProvider } from '@/common/utils/rbac';
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

export function authorize(options: AuthorizationOptions) {
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

      let accessResult: AccessResult;

      // Check visibility dựa trên resource type
      switch (options.resourceType) {
        case 'workspace':
          accessResult = await rbacProvider.canViewWorkspace(
            userId,
            resourceId
          );
          break;

        case 'board':
        case 'list':
        case 'card':
          // List và Card đều thuộc về Board, nên check board
          accessResult = await rbacProvider.canViewBoard(userId, resourceId);
          break;

        default:
          return res.status(400).json({
            success: false,
            message: 'Invalid resource type',
          });
      }

      if (!accessResult.allowed) {
        if (
          options.allowPublic &&
          accessResult.reason === 'Authentication required'
        ) {
          // Public access allowed, tiếp tục
        } else {
          return res.status(403).json({
            success: false,
            message:
              options.errorMessage || accessResult.reason || 'Access denied',
          });
        }
      }

      if (options.permission && userId) {
        let hasPermission = false;

        if (options.resourceType === 'workspace') {
          hasPermission = await rbacProvider.hasWorkspacePermission(
            userId,
            resourceId,
            options.permission
          );
        } else {
          hasPermission = await rbacProvider.hasBoardPermission(
            userId,
            resourceId,
            options.permission
          );
        }

        if (!hasPermission) {
          return res.status(403).json({
            success: false,
            message: options.errorMessage || 'Insufficient permissions',
          });
        }
      }

      if (accessResult.userContext) {
        req.userContext = accessResult.userContext;
      }

      next();
    } catch (error) {
      console.error('Authorization error:', error);
      return res.status(500).json({
        success: false,
        message: 'Authorization check failed',
      });
    }
  };
}

export function canAccessWorkspace(
  idField: string = 'workspaceId',
  idSource: 'params' | 'body' | 'query' = 'params'
) {
  return authorize({
    resourceType: 'workspace',
    resourceIdSource: idSource,
    resourceIdField: idField,
  });
}

export function canAccessBoard(
  idField: string = 'boardId',
  idSource: 'params' | 'body' | 'query' = 'params',
  allowPublic: boolean = false
) {
  return authorize({
    resourceType: 'board',
    resourceIdSource: idSource,
    resourceIdField: idField,
    allowPublic,
  });
}

export function requireWorkspacePermission(
  permission: Permission,
  idField: string = 'id',
  idSource: 'params' | 'body' | 'query' = 'params'
) {
  return authorize({
    resourceType: 'workspace',
    resourceIdSource: idSource,
    resourceIdField: idField,
    permission,
  });
}

export function requireBoardPermission(
  permission: Permission,
  idField: string = 'id',
  idSource: 'params' | 'body' | 'query' = 'params'
) {
  return authorize({
    resourceType: 'board',
    resourceIdSource: idSource,
    resourceIdField: idField,
    permission,
  });
}

export function requireWorkspaceRole(
  allowedRoles: Role[],
  idField: string = 'workspaceId',
  idSource: 'params' | 'body' | 'query' = 'params'
) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required',
        });
      }

      let workspaceId: string | null = null;
      switch (idSource) {
        case 'params':
          workspaceId = req.params[idField];
          break;
        case 'body':
          workspaceId = req.body[idField];
          break;
        case 'query':
          workspaceId = req.query[idField] as string;
          break;
      }

      if (!workspaceId) {
        return res.status(400).json({
          success: false,
          message: `${idField} is required`,
        });
      }

      const membership = await rbacProvider.getWorkspaceMembership(
        userId,
        workspaceId
      );
      if (!membership) {
        return res.status(403).json({
          success: false,
          message: 'Not a workspace member',
        });
      }

      if (!allowedRoles.includes(membership.role)) {
        return res.status(403).json({
          success: false,
          message: 'Insufficient role privileges',
        });
      }

      req.userContext = {
        userId,
        workspaceRole: membership.role,
        isWorkspaceMember: true,
        isBoardMember: false,
      };

      next();
    } catch (error) {
      console.error('Role check error:', error);
      return res.status(500).json({
        success: false,
        message: 'Role check failed',
      });
    }
  };
}

export function requireBoardRole(
  allowedRoles: Role[],
  idField: string = 'boardId',
  idSource: 'params' | 'body' | 'query' = 'params'
) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required',
        });
      }

      let boardId: string | null = null;
      switch (idSource) {
        case 'params':
          boardId = req.params[idField];
          break;
        case 'body':
          boardId = req.body[idField];
          break;
        case 'query':
          boardId = req.query[idField] as string;
          break;
      }

      if (!boardId) {
        return res.status(400).json({
          success: false,
          message: `${idField} is required`,
        });
      }

      // Lấy effective role (cao nhất giữa board và workspace)
      const effectiveRole = await rbacProvider.getEffectiveBoardRole(
        userId,
        boardId
      );
      if (!effectiveRole) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to access this board',
        });
      }

      if (!allowedRoles.includes(effectiveRole)) {
        return res.status(403).json({
          success: false,
          message: 'Insufficient role privileges',
        });
        console.log('🔐 Board Permissions:', {
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

          if(!ok) {
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
>>>>>>> 6f02d2c (feat: repair rbac)
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
          console.error('Role check error:', error);
          return res.status(500).json({
            success: false,
            message: 'Role check failed',
          });
        }
      };
    }

    export const boardMember = requireBoardRole([
      ROLES.BOARD_OWNER,
      ROLES.BOARD_ADMIN,
      ROLES.BOARD_MEMBER,
      ROLES.WORKSPACE_ADMIN,
      ROLES.WORKSPACE_MODERATOR,
      ROLES.WORKSPACE_MEMBER,
    ]);

    export const boardAdmin = requireBoardRole([
      ROLES.BOARD_OWNER,
      ROLES.BOARD_ADMIN,
      ROLES.WORKSPACE_ADMIN,
      ROLES.WORKSPACE_MODERATOR,
    ]);

    export const boardOwner = requireBoardRole([
      ROLES.BOARD_OWNER,
      ROLES.WORKSPACE_ADMIN,
    ]);

    export const workspaceAdmin = requireWorkspaceRole(
      [ROLES.WORKSPACE_ADMIN, ROLES.ADMIN],
      'id'
    );

    export const workspaceMember = requireWorkspaceRole(
      [
        ROLES.WORKSPACE_ADMIN,
        ROLES.WORKSPACE_MODERATOR,
        ROLES.WORKSPACE_MEMBER,
        ROLES.WORKSPACE_OBSERVER,
      ],
      'id'
    );

    export function requireWorkspacePermissions(
      permissions: Permission[],
      idField: string = 'id',
      idSource: 'params' | 'body' | 'query' = 'params'
    ) {
      return async (req: Request, res: Response, next: NextFunction) => {
        try {
          const userId = req.user?.userId;
          if (!userId) {
            return res.status(401).json({
              success: false,
              message: 'Authentication required',
            });
          }

          let workspaceId: string | null = null;
          switch (idSource) {
            case 'params':
              workspaceId = req.params[idField];
              break;
            case 'body':
              workspaceId = req.body[idField];
              break;
            case 'query':
              workspaceId = req.query[idField] as string;
              break;
          }

          if (!workspaceId) {
            return res.status(400).json({
              success: false,
              message: `${idField} is required`,
            });
          }

          const membership = await rbacProvider.getWorkspaceMembership(
            userId,
            workspaceId
          );
          if (!membership) {
            return res.status(403).json({
              success: false,
              message: 'Not a workspace member',
            });
          }

          for (const permission of permissions) {
            const hasPermission = await rbacProvider.hasWorkspacePermission(
              userId,
              workspaceId,
              permission
            );
            if (!hasPermission) {
              return res.status(403).json({
                success: false,
                message: 'Insufficient permissions',
              });
            }
          }

          req.userContext = {
            userId,
            workspaceRole: membership.role,
            isWorkspaceMember: true,
            isBoardMember: false,
          };

          next();
        } catch (error) {
          console.error('Permission check error:', error);
          return res.status(500).json({
            success: false,
            message: 'Permission check failed',
          });
        }
      };
    }

    export function requireBoardPermissions(
      permissions: Permission | Permission[],
      idField: string = 'id',
      idSource: 'params' | 'body' | 'query' = 'params'
    ) {
      // Normalize to array
      const permissionArray = Array.isArray(permissions)
        ? permissions
        : [permissions];

      return async (req: Request, res: Response, next: NextFunction) => {
        try {
          const userId = req.user?.userId;
          if (!userId) {
            return res.status(401).json({
              success: false,
              message: 'Authentication required',
            });
          }

          let boardId: string | null = null;
          switch (idSource) {
            case 'params':
              boardId = req.params[idField];
              break;
            case 'body':
              boardId = req.body[idField];
              break;
            case 'query':
              boardId = req.query[idField] as string;
              break;
          }

          if (!boardId) {
            return res.status(400).json({
              success: false,
              message: `${idField} is required`,
            });
          }

          for (const permission of permissionArray) {
            const hasPermission = await rbacProvider.hasBoardPermission(
              userId,
              boardId,
              permission
            );
            if (!hasPermission) {
              return res.status(403).json({
                success: false,
                message: 'Insufficient permissions',
              });
            }
          }

          const effectiveRole = await rbacProvider.getEffectiveBoardRole(
            userId,
            boardId
          );
          const boardMembership = await rbacProvider.getBoardMembership(
            userId,
            boardId
          );

          req.userContext = {
            userId,
            boardRole: boardMembership?.role || effectiveRole || undefined,
            isWorkspaceMember: effectiveRole !== boardMembership?.role,
            isBoardMember: !!boardMembership,
          };

          next();
        } catch (error) {
          console.error('Permission check error:', error);
          return res.status(500).json({
            success: false,
            message: 'Permission check failed',
          });
        }
      };
    }

    export const checkBoardAccess = canAccessBoard;

    export const requireWorkspaceRoles = requireWorkspaceRole;

    export { AuthorizationOptions, PERMISSIONS, ROLES };
  }
}
