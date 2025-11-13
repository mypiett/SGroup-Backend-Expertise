import { Router } from 'express';
import { WorkspaceController } from './workspace.controller';

const route = Router();

route.post('/create', (req, res) =>
  WorkspaceController.createWorkspace(req, res)
);

route.get('/my-workspaces', (req, res) =>
  WorkspaceController.getUserWorkspaces(req, res)
);

route.get('/', (req, res) => WorkspaceController.getAllWorkspaces(req, res));

route.get('/:id', (req, res) => WorkspaceController.getWorkspaceById(req, res));

route.put('/:id', (req, res) => WorkspaceController.updateWorkspace(req, res));

route.delete('/:id', (req, res) =>
  WorkspaceController.deleteWorkspace(req, res)
);

export default route;
