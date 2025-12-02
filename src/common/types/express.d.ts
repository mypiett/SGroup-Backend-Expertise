import { Request } from 'express';
import type { File as MulterFile } from 'multer';
// Extend Express Request type để có type-safety cho authenticated requests
declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        email: string;
        [key: string]: any;
      };

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
}
