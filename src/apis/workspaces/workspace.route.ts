import { Router } from 'express';
import { WorkspaceController } from './workspace.controller';
import { handleServiceResponse } from '@/common/utils/httpHandlers';

const route = Router();

/**
 * @swagger
 * /workspaces/all:
 *   get:
 *     tags:
 *       - Workspace
 *     summary: Get all workspaces (Development only)
 *     description: Retrieve all workspaces in the system. For development purposes only.
 *     security:
 *      - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully retrieved all workspaces
 *       500:
 *         description: Server Error
 */
route.get('/all', async (_req, res) => {
  const serviceResponse = await WorkspaceController.getAllWorkspaces();
  return handleServiceResponse(serviceResponse, res);
});

/**
 * @swagger
 * /workspaces:
 *   post:
 *     tags:
 *       - Workspace
 *     summary: Create a new workspace
 *     description: Create a new workspace for the authenticated user
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 example: My Workspace
 *               description:
 *                 type: string
 *                 example: This is my workspace description
 *     responses:
 *       201:
 *         description: Workspace created successfully
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server Error
 */
route.post('/', async (req, res) => {
  const serviceResponse = await WorkspaceController.createWorkspace(req);
  return handleServiceResponse(serviceResponse, res);
});

/**
 * @swagger
 * /workspaces:
 *   get:
 *     tags:
 *       - Workspace
 *     summary: Get user's workspaces
 *     description: Retrieve all workspaces belonging to the authenticated user
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully retrieved workspaces
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server Error
 */
route.get('/', async (req, res) => {
  const serviceResponse = await WorkspaceController.getUserWorkspaces(req);
  return handleServiceResponse(serviceResponse, res);
});

/**
 * @swagger
 * /workspaces/archived:
 *   get:
 *     tags:
 *       - Workspace
 *     summary: Get user's archived workspaces
 *     description: Retrieve all archived workspaces belonging to the authenticated user
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully retrieved archived workspaces
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server Error
 */
route.get('/archived', async (req, res) => {
  const serviceResponse = await WorkspaceController.getArchivedWorkspaces(req);
  return handleServiceResponse(serviceResponse, res);
});

/**
 * @swagger
 * /workspaces/{id}:
 *   get:
 *     tags:
 *       - Workspace
 *     summary: Get workspace by ID
 *     description: Retrieve a specific workspace by its ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Workspace ID
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successfully retrieved workspace
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Workspace not found
 *       500:
 *         description: Server Error
 */
route.get('/:id', async (req, res) => {
  const serviceResponse = await WorkspaceController.getWorkspaceById(req);
  return handleServiceResponse(serviceResponse, res);
});

/**
 * @swagger
 * /workspaces/{id}:
 *   put:
 *     tags:
 *       - Workspace
 *     summary: Update workspace
 *     description: Update workspace information
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Workspace ID
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: Updated Workspace Name
 *               description:
 *                 type: string
 *                 example: Updated description
 *     responses:
 *       200:
 *         description: Workspace updated successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Workspace not found
 *       500:
 *         description: Server Error
 */
route.put('/:id', async (req, res) => {
  const serviceResponse = await WorkspaceController.updateWorkspace(req);
  return handleServiceResponse(serviceResponse, res);
});

/**
 * @swagger
 * /workspaces/{id}:
 *   delete:
 *     tags:
 *       - Workspace
 *     summary: Delete workspace
 *     description: Permanently delete a workspace
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Workspace ID
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Workspace deleted successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Workspace not found
 *       500:
 *         description: Server Error
 */
route.delete('/:id', async (req, res) => {
  const serviceResponse = await WorkspaceController.deleteWorkspace(req);
  return handleServiceResponse(serviceResponse, res);
});

/**
 * @swagger
 * /workspaces/{id}/archive:
 *   patch:
 *     tags:
 *       - Workspace
 *     summary: Archive workspace
 *     description: Archive a workspace (soft delete)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Workspace ID
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Workspace archived successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Workspace not found
 *       500:
 *         description: Server Error
 */
route.patch('/:id/archive', async (req, res) => {
  const serviceResponse = await WorkspaceController.archiveWorkspace(req);
  return handleServiceResponse(serviceResponse, res);
});

/**
 * @swagger
 * /workspaces/{id}/reopen:
 *   patch:
 *     tags:
 *       - Workspace
 *     summary: Reopen workspace
 *     description: Reopen an archived workspace
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Workspace ID
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Workspace reopened successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Workspace not found
 *       500:
 *         description: Server Error
 */
route.patch('/:id/reopen', async (req, res) => {
  const serviceResponse = await WorkspaceController.reopenWorkspace(req);
  return handleServiceResponse(serviceResponse, res);
});

/**
 * @swagger
 * /workspaces/{id}/members:
 *   get:
 *     tags:
 *       - Workspace
 *     summary: Get workspace members
 *     description: Retrieve all members of a workspace
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Workspace ID
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successfully retrieved workspace members
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Workspace not found
 *       500:
 *         description: Server Error
 */
route.get('/:id/members', async (req, res) => {
  const serviceResponse = await WorkspaceController.getWorkspaceMembers(req);
  return handleServiceResponse(serviceResponse, res);
});

/**
 * @swagger
 * /workspaces/{id}/members:
 *   post:
 *     tags:
 *       - Workspace
 *     summary: Add member to workspace
 *     description: Add a new member to the workspace
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Workspace ID
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *             properties:
 *               userId:
 *                 type: string
 *                 example: 507f1f77bcf86cd799439011
 *               roleId:
 *                 type: string
 *                 example: 507f1f77bcf86cd799439012
 *     responses:
 *       200:
 *         description: Member added successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Workspace or user not found
 *       500:
 *         description: Server Error
 */
route.post('/:id/members', async (req, res) => {
  const serviceResponse = await WorkspaceController.addMember(req);
  return handleServiceResponse(serviceResponse, res);
});

/**
 * @swagger
 * /workspaces/{id}/invite:
 *   post:
 *     tags:
 *       - Workspace
 *     summary: Invite member by email
 *     description: Invite a user to join the workspace by email. If user exists, add directly. If not, send invitation email.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Workspace ID
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - roleName
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: user@example.com
 *               roleName:
 *                 type: string
 *                 example: workspace_member
 *                 description: Role name (workspace_admin, workspace_moderator, workspace_member, workspace_observer)
 *     responses:
 *       201:
 *         description: Invitation sent or user added successfully
 *       400:
 *         description: Invalid input or user already a member
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Workspace or role not found
 *       500:
 *         description: Server Error
 */
route.post('/:id/invite', async (req, res) => {
  const serviceResponse = await WorkspaceController.inviteMemberByEmail(req);
  return handleServiceResponse(serviceResponse, res);
});

/**
 * @swagger
 * /workspaces/{id}/members/{memberId}:
 *   patch:
 *     tags:
 *       - Workspace
 *     summary: Update member role
 *     description: Update the role of a workspace member
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Workspace ID
 *         schema:
 *           type: string
 *       - in: path
 *         name: memberId
 *         required: true
 *         description: Member ID
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - roleId
 *             properties:
 *               roleId:
 *                 type: string
 *                 example: 507f1f77bcf86cd799439012
 *     responses:
 *       200:
 *         description: Member role updated successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Workspace or member not found
 *       500:
 *         description: Server Error
 */
route.patch('/:id/members/:memberId', async (req, res) => {
  const serviceResponse = await WorkspaceController.updateMemberRole(req);
  return handleServiceResponse(serviceResponse, res);
});

/**
 * @swagger
 * /workspaces/{id}/members/{memberId}:
 *   delete:
 *     tags:
 *       - Workspace
 *     summary: Remove member from workspace
 *     description: Remove a member from the workspace
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Workspace ID
 *         schema:
 *           type: string
 *       - in: path
 *         name: memberId
 *         required: true
 *         description: Member ID
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Member removed successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Workspace or member not found
 *       500:
 *         description: Server Error
 */
route.delete('/:id/members/:memberId', async (req, res) => {
  const serviceResponse = await WorkspaceController.removeMember(req);
  return handleServiceResponse(serviceResponse, res);
});

export default route;
