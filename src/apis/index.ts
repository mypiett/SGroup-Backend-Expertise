import { Router } from 'express';
import UserRouter from './users/user.route';
import AuthRouter from './auth/auth.route';
import WorkspaceRouter from './workspaces/workspace.route';
import authenticateJWT from '../common/middleware/authentication';

const route = Router();
route.use('/users', authenticateJWT, UserRouter);
route.use('/auth', AuthRouter);
route.use('/workspace', authenticateJWT, WorkspaceRouter);
export default route;
