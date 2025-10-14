import { Router } from 'express';
import { WorkspaceController } from './workspace.controller';

const route = Router();

route.post('/create', WorkspaceController.createWorkspace);
route.get('/', WorkspaceController.getAllWorkspaces);
route.get('/:id', WorkspaceController.getWorkspaceById);
route.put('/:id', WorkspaceController.updateWorkspace);
route.delete('/:id', WorkspaceController.deleteWorkspace);
export default route;
