import { Router } from 'express';

import authenticateJWT from '@/common/middleware/authentication';
import { handleServiceResponse } from '@/common/utils/httpHandlers';

import { RoleController } from './role.controller';

const roleRoute = Router();
const roleController = new RoleController();

/**
 * @swagger
 * /roles:
 *   get:
 *     summary: Get all roles
 *     tags: [Roles]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully retrieved all roles
 *       401:
 *         description: Unauthorized
 */
roleRoute.get('/', authenticateJWT, async (req, res) => {
  const serviceResponse = await roleController.getAllRoles();
  return handleServiceResponse(serviceResponse, res);
});

/**
 * @swagger
 * /roles/groups:
 *   get:
 *     summary: Get all role groups with their roles
 *     tags: [Roles]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully retrieved all role groups
 *       401:
 *         description: Unauthorized
 */
roleRoute.get('/groups', authenticateJWT, async (req, res) => {
  const serviceResponse = await roleController.getAllRoleGroups();
  return handleServiceResponse(serviceResponse, res);
});

/**
 * @swagger
 * /roles/group/{group}:
 *   get:
 *     summary: Get roles by group
 *     tags: [Roles]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: group
 *         required: true
 *         schema:
 *           type: string
 *           enum: [system, workspace, board, basic]
 *         description: Role group name
 *     responses:
 *       200:
 *         description: Successfully retrieved roles by group
 *       400:
 *         description: Invalid group name
 *       401:
 *         description: Unauthorized
 */
roleRoute.get('/group/:group', authenticateJWT, async (req, res) => {
  const serviceResponse = await roleController.getRolesByGroup(req);
  return handleServiceResponse(serviceResponse, res);
});

/**
 * @swagger
 * /roles/id/{id}:
 *   get:
 *     summary: Get role by ID
 *     tags: [Roles]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Role ID
 *     responses:
 *       200:
 *         description: Successfully retrieved role
 *       404:
 *         description: Role not found
 *       401:
 *         description: Unauthorized
 */
roleRoute.get('/id/:id', authenticateJWT, async (req, res) => {
  const serviceResponse = await roleController.getRoleById(req);
  return handleServiceResponse(serviceResponse, res);
});

/**
 * @swagger
 * /roles/name/{name}:
 *   get:
 *     summary: Get role by name
 *     tags: [Roles]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: name
 *         required: true
 *         schema:
 *           type: string
 *         description: Role name
 *     responses:
 *       200:
 *         description: Successfully retrieved role
 *       404:
 *         description: Role not found
 *       401:
 *         description: Unauthorized
 */
roleRoute.get('/name/:name', authenticateJWT, async (req, res) => {
  const serviceResponse = await roleController.getRoleByName(req);
  return handleServiceResponse(serviceResponse, res);
});

export default roleRoute;
