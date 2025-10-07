import { Router } from 'express';
import UserRouter from './users/user.route';
import AuthRouter from './auth/auth.route';

const route = Router();
route.use('/users', UserRouter);
route.use('/auth', AuthRouter);
export default route;
