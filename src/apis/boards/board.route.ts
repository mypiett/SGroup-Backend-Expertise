import { Router } from 'express';
import { BoardController } from './board.controller';
import {
  handleServiceResponse,
  validateHandle,
  validateRequest,
} from '@/common/utils/httpHandlers';
import {
  checkBoardAccess,
  requireBoardPermissions,
  requireWorkspaceRoles,
} from '@/common/middleware/authorization';
import { PERMISSIONS } from '@/common/constants/permissions';
import { addMemberToBoardSchema } from './board.schema';
import { ROLES } from '@/common/constants';
import { ListController } from '../lists/list.controller';
import { CreateListSchema } from '../lists/list.schema';
const route = Router();

/**
 * @swagger
 * /boards:
 *   post:
 *     tags:
 *       - Boards
 *     summary: Create new board
 *     description: Create a new board inside a workspace
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - workspaceId
 *             properties:
 *               title:
 *                 type: string
 *                 example: Sprint 1
 *               description:
 *                 type: string
 *                 example: Board cho sprint đầu tiên
 *               coverUrl:
 *                 type: string
 *                 example: https://example.com/cover.png
 *               workspaceId:
 *                 type: string
 *                 example: "a3b9e74d-1234-5678-9abc-def012345678"
 *               visibility:
 *                 type: string
 *                 enum: [private, public, workspace]
 *                 example: private
 *     responses:
 *       201:
 *         description: Board created successfully
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 */
route.post(
  '/',
  authenticateJWT,
  requireWorkspaceRoles(
    [ROLES.WORKSPACE_ADMIN, ROLES.WORKSPACE_MEMBER, ROLES.WORKSPACE_MODERATOR],
    'workspaceId',
    'body'
  ),
  async (req, res) => {
    const serviceResponse = await BoardController.create(req);
    return handleServiceResponse(serviceResponse, res);
  }
);

/**
 * @swagger
 * /boards:
 *   get:
 *     tags:
 *       - Boards
 *     summary: Get boards by workspace
 *     description: Retrieve all boards in a workspace (not closed)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: workspaceId
 *         required: true
 *         description: Workspace ID
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Boards retrieved successfully
 *       400:
 *         description: workspaceId missing or invalid
 *       401:
 *         description: Unauthorized
 */
route.get('/', authenticateJWT, async (req, res) => {
  const serviceResponse = await BoardController.findAll(req);
  return handleServiceResponse(serviceResponse, res);
});

/**
 * @swagger
 * /boards/{id}:
 *   get:
 *     tags:
 *       - Boards
 *     summary: Get board by ID
 *     description: Retrieve a specific board (access based on visibility)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Board ID
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Board retrieved successfully
 *       404:
 *         description: Board not found
 *       403:
 *         description: Forbidden (access denied based on visibility)
 */
route.get('/:id', authenticateJWT, checkBoardAccess('id'), async (req, res) => {
  const serviceResponse = await BoardController.findOne(req);
  return handleServiceResponse(serviceResponse, res);
});

/**
 * @swagger
 * /boards/{id}:
 *   put:
 *     tags:
 *       - Boards
 *     summary: Update board
 *     description: Update board information (requires board member permission)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Board ID
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               coverUrl:
 *                 type: string
 *               isClosed:
 *                 type: boolean
 *               visibility:
 *                 type: string
 *                 enum: [private, public, workspace]
 *     responses:
 *       200:
 *         description: Board updated successfully
 *       400:
 *         description: Invalid input
 *       404:
 *         description: Board not found
 *       403:
 *         description: Forbidden (requires boards:update permission)
 */
route.put(
  '/:id',
  authenticateJWT,
  checkBoardAccess('id'),
  requireBoardPermissions(PERMISSIONS.BOARDS_UPDATE),
  async (req, res) => {
    const serviceResponse = await BoardController.update(req);
    return handleServiceResponse(serviceResponse, res);
  }
);

/**
 * @swagger
 * /boards/{id}/archive:
 *   patch:
 *     tags:
 *       - Boards
 *     summary: Close board
 *     description: Soft delete board (set isClosed = true)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Board ID
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Board closed successfully
 *       404:
 *         description: Board not found
 *       403:
 *         description: Forbidden (requires boards:delete permission)
 */
route.patch(
  '/:id/archive',
  authenticateJWT,
  requireBoardPermissions(PERMISSIONS.BOARDS_DELETE),
  async (req, res) => {
    const serviceResponse = await BoardController.closeBoard(req);
    return handleServiceResponse(serviceResponse, res);
  }
);

/**
 * @swagger
 * /boards/{id}/reopen:
 *   patch:
 *     tags:
 *       - Boards
 *     summary: Reopen a closed board
 *     description: Restore a previously closed board (set isClosed = false)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Board ID
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Board reopened successfully
 *       404:
 *         description: Board not found
 *       403:
 *         description: Forbidden (requires boards:update permission)
 */
route.patch(
  '/:id/reopen',
  authenticateJWT,
  requireBoardPermissions(PERMISSIONS.BOARDS_UPDATE),
  async (req, res) => {
    const serviceResponse = await BoardController.reopenBoard(req);
    return handleServiceResponse(serviceResponse, res);
  }
);

/**
 * @swagger
 * /boards/{id}:
 *   delete:
 *     tags:
 *       - Boards
 *     summary: Permanently delete a board
 *     description: Permanently deletes the specified board from the database
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Board ID
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Board deleted permanently
 *       404:
 *         description: Board not found
 *       500:
 *         description: Server Error
 */
route.delete(
  '/:id',
  authenticateJWT,
  requireBoardPermissions(PERMISSIONS.BOARDS_DELETE),
  async (req, res) => {
    const serviceResponse = await BoardController.deleteBoardPermanently(req);
    return handleServiceResponse(serviceResponse, res);
  }
);

/**
 * @swagger
 * /boards/{id}/invite:
 *   post:
 *     tags:
 *       - Boards
 *     summary: Invite a user to a board
 *     description: Add a member to a board and send an email notification. Only board owner or admin can invite.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the board
 *         example: "board-id-123"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - roleId
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: user@example.com
 *               roleId:
 *                 type: string
 *                 example: board_role_id
 *                 description: Role Id (BOARD_ADMIN, BOARD_OWNER, BOARD_MEMBER, BOARD_OBSERVER)
 *     responses:
 *       201:
 *         description: Member added successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Member added to board successfully"
 *                 member:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     boardId:
 *                       type: string
 *                     user:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                         name:
 *                           type: string
 *                         email:
 *                           type: string
 *                     role:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                         name:
 *                           type: string
 *       400:
 *         description: Bad request (missing email or invalid role)
 *       403:
 *         description: Forbidden (not owner/admin or user already a member)
 *       404:
 *         description: Board, user, or role not found
 */
route.post(
  '/:id/invite',
  authenticateJWT,
  validateHandle(addMemberToBoardSchema),
  checkBoardAccess('id'),
  requireBoardPermissions(PERMISSIONS.MEMBERS_INVITE),
  async (req, res) => {
    const serviceResponse = await BoardController.addMemberToBoard(req);
    return handleServiceResponse(serviceResponse, res);
  }
);

/**
 * @swagger
 * /boards/{id}/generate-link:
 *   post:
 *     tags:
 *       - Boards
 *     summary: Generate a share link for a board
 *     description: Only board owner or admin can generate a share link.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the board
 *         example: "board-id-123"
 *     responses:
 *       200:
 *         description: Invite link created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Invite link created successfully"
 *                 link:
 *                   type: string
 *                   example: "http://localhost:3000/boards/board-id-123/invite/abcdef123456"
 *       400:
 *         description: Bad request (failed to create invite link)
 *       401:
 *         description: Unauthorized (not a board member or insufficient role)
 */
route.post(
  '/:id/generate-link',
  authenticateJWT,
  requireBoardPermissions(PERMISSIONS.MEMBERS_INVITE),
  async (req, res) => {
    const serviceResponse = await BoardController.createLinkShareBoard(req);
    return handleServiceResponse(serviceResponse, res);
  }
);

/**
 * @swagger
 * /boards/{id}/invite-link:
 *   delete:
 *     tags:
 *       - Boards
 *     summary: Delete a board's share link
 *     description: Only board owner or admin can delete the share link.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the board
 *         example: "board-id-123"
 *     responses:
 *       200:
 *         description: Invite link deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Invite link deleted successfully"
 *       400:
 *         description: Bad request (no link to delete or failed)
 *       401:
 *         description: Unauthorized (not a board member or insufficient role)
 */
route.delete(
  '/:id/invite-link',
  authenticateJWT,
  requireBoardPermissions(PERMISSIONS.MEMBERS_MANAGE),
  async (req, res) => {
    const serviceResponse = await BoardController.deleteLinkShareBoard(req);
    return handleServiceResponse(serviceResponse, res);
  }
);

/**
 * @swagger
 * /boards/{id}/invite/{inviteToken}:
 *   post:
 *     tags:
 *       - Boards
 *     summary: Join a board via invite link
 *     description: User joins the board using the invite token. Default role is BOARD_MEMBER.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the board
 *         example: "board-id-123"
 *       - in: path
 *         name: inviteToken
 *         required: true
 *         schema:
 *           type: string
 *         description: Invitation token
 *         example: "abcdef123456"
 *     responses:
 *       200:
 *         description: Successfully joined the board
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "You joined this board successfully"
 *                 member:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     boardId:
 *                       type: string
 *                     userId:
 *                       type: string
 *                     roleId:
 *                       type: string
 *                     user:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                         name:
 *                           type: string
 *                         email:
 *                           type: string
 *       400:
 *         description: Failed to join (invalid token or already a member)
 *       401:
 *         description: Unauthorized (user not logged in)
 */
route.post('/:id/invite/:inviteToken', authenticateJWT, async (req, res) => {
  const serviceResponse = await BoardController.JoinBoardByLink(req);
  return handleServiceResponse(serviceResponse, res);
});

/**
 * @swagger
 * /lists/{boardId}/lists:
 *   get:
 *     tags:
 *       - Lists
 *     summary: Get all lists in a board
 *     description: Retrieve all lists that belong to a specific board
 *     parameters:
 *       - in: path
 *         name: boardId
 *         required: true
 *         description: ID of the board to fetch lists from
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Lists retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                     format: uuid
 *                     example: "e4f9a123-4567-8901-2345-67890abcdef"
 *                   title:
 *                     type: string
 *                     example: "My List"
 *                   position:
 *                     type: number
 *                     example: 0
 *                   isArchived:
 *                     type: boolean
 *                     example: false
 *       400:
 *         description: Invalid boardId
 *       404:
 *         description: Board not found
 *       500:
 *         description: Server error
 */
route.get('/:boardId/lists', async (req, res) => {
  const response = await ListController.getAllListsByBoard(req);
  return handleServiceResponse(response, res);
});

/**
 * @swagger
 * /boards/{boardId}/lists:
 *   post:
 *     tags:
 *       - Lists
 *     summary: Create a new list in a board
 *     parameters:
 *       - in: path
 *         name: boardId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID of the board
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *             properties:
 *               title:
 *                 type: string
 *                 example: "New List"
 *     responses:
 *       201:
 *         description: List created successfully
 *       400:
 *         description: Invalid input
 *       404:
 *         description: Board not found
 */
route.post(
  '/:boardId/lists',
  validateRequest(CreateListSchema),
  async (req, res) => {
    const response = await ListController.createList(req);
    return handleServiceResponse(response, res);
  }
);
export default route;
