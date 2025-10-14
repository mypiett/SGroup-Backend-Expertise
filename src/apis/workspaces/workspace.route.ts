import { Router } from 'express';
import { WorkspaceController } from './workspace.controller';

const route = Router();

route.post('/create', WorkspaceController.createWorkspace);

export default route;
