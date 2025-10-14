import { Router } from 'express';
import UserRouter from './users/user.route';
import AuthRouter from './auth/auth.route';
import WorkspaceRouter from './workspaces/workspace.route';

const route = Router();
route.use('/users', UserRouter);
route.use('/auth', AuthRouter);
route.use('/workspace', WorkspaceRouter);
export default route;
