import { Router } from 'express';

import authenticateJWT from '../common/middleware/authentication';
import AuthRouter from './auth/auth.route';
import BoardRouter from './boards/board.route';
import RoleRouter from './roles/role.route';
import UserRouter from './users/user.route';
import WorkspaceRouter from './workspaces/workspace.route';

const route = Router();
route.use('/users', UserRouter);
route.use('/auth', AuthRouter);
route.use('/workspaces', authenticateJWT, WorkspaceRouter);
route.use('/boards', authenticateJWT, BoardRouter);
route.use('/roles', authenticateJWT, RoleRouter);
export default route;
