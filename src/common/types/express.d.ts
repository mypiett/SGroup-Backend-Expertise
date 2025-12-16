import { Request } from 'express';
import type { File as MulterFile } from 'multer';
import type { Role } from '@/common/constants/roles';

// User context được attach bởi authorization middleware
export interface UserContext {
  userId: string;
  workspaceRole?: Role;
  isWorkspaceMember?: boolean;
  boardRole?: Role;
  isBoardMember?: boolean;
}

// Extend Express Request type để có type-safety cho authenticated requests
declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        email: string;
        [key: string]: any;
      };
      userContext?: UserContext;
      resolvedBoardId?: string;

      file?: MulterFile;
      files?: MulterFile[] | { [fieldname: string]: MulterFile[] };
    }
  }
}

// Export để có thể import ở nơi khác nếu cần
export interface AuthenticatedRequest extends Request {
  user: {
    userId: string;
    email: string;
    [key: string]: any;
  };
  userContext?: UserContext;
}
