import { Router } from 'express';
import { WorkspaceController } from './workspace.controller';
import authentication from '../../common/middleware/authentication';
import {
  loadUserRoles,
  requireRole,
  requirePermission,
  requireRoleAndPermission,
  authorize,
} from '../../common/middleware/authorization';
const route = Router();

route.use(authentication, loadUserRoles);

route.post(
  '/create',
  requireRole('ADMIN'),
  WorkspaceController.createWorkspace
);

route.get(
  '/',
  requirePermission('workspace:read'),
  WorkspaceController.getAllWorkspaces
);

route.get(
  '/:id',
  authorize({
    roles: ['ADMIN'],
    permissions: ['workspace:read'],
    allowOwnership: true,
    ownershipField: 'userId',
  }),
  WorkspaceController.getWorkspaceById
);

route.put(
  '/:id',
  requireRoleAndPermission('ADMIN', 'workspace:update'),
  WorkspaceController.updateWorkspace
);

route.delete('/:id', requireRole('ADMIN'), WorkspaceController.deleteWorkspace);

export default route;
