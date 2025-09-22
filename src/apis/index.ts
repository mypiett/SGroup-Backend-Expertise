import { Router } from 'express';
import UserRouter from './users/user.route';
const route = Router();
route.use('/users', UserRouter);
export default route;
