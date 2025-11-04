import { Router } from 'express';
import { BoardController } from './board.controller';
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
  requirePermission('board:create'),
  BoardController.create
);

route.get('/', requirePermission('board:read'), BoardController.findAll);

route.get(
  '/:id',
  authorize({
    roles: ['ADMIN'],
    permissions: ['board:read'],
    allowOwnership: true,
    ownershipField: 'userId',
  }),
  BoardController.findOne
);

route.put(
  '/:id',
  requireRoleAndPermission('ADMIN', 'board:update'),
  BoardController.update
);

route.delete(
  '/:id',
  requireRole('ADMIN'),
  requirePermission('board:delete'),
  BoardController.delete
);

export default route;
