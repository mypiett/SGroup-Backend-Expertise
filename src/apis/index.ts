import { Router } from 'express';
import UserRouter from './users/user.route';
import AuthRouter from './auth/auth.route';
import WorkspaceRouter from './workspaces/workspace.route';
import BoardRouter from './boards/board.route';
import authenticateJWT from '../common/middleware/authentication';

const route = Router();
route.use('/users', authenticateJWT, UserRouter);
route.use('/auth', AuthRouter);
route.use('/workspace', authenticateJWT, WorkspaceRouter);
route.use('/board', authenticateJWT, BoardRouter);
export default route;
