import { Router } from 'express';
import { BoardController } from './board.controller';
import {
  handleServiceResponse,
  validateHandle,
} from '@/common/utils/httpHandlers';
import authenticateJWT from '@/common/middleware/authentication';
import {
  // requireWorkspacePermissions,
  requireBoardPermissions,
} from '@/common/middleware/authorization';
import { PERMISSIONS } from '@/common/constants/permissions';
import { addMemberToBoardSchema } from './board.schema';
const route = Router();

/**
 * @swagger
 * /boards/create:
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
  '/create',
  authenticateJWT,

  // requireWorkspacePermissions(PERMISSIONS.BOARDS_CREATE),
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
route.get(
  '/',
  authenticateJWT,
  // requireWorkspacePermissions(PERMISSIONS.BOARDS_READ),
  async (req, res) => {
    const serviceResponse = await BoardController.findAll(req);
    return handleServiceResponse(serviceResponse, res);
  }
);

/**
 * @swagger
 * /boards/{id}:
 *   get:
 *     tags:
 *       - Boards
 *     summary: Get board by ID
 *     description: Retrieve a specific board
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
 *         description: Forbidden (no permission boards:read on this board)
 */
route.get(
  '/:id',
  authenticateJWT,
  requireBoardPermissions(PERMISSIONS.BOARDS_READ),
  async (req, res) => {
    const serviceResponse = await BoardController.findOne(req);
    return handleServiceResponse(serviceResponse, res);
  }
);

/**
 * @swagger
 * /boards/{id}:
 *   put:
 *     tags:
 *       - Boards
 *     summary: Update board
 *     description: Update board information
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
 *         description: Forbidden (no permission boards:update on this board)
 */
route.put(
  '/:id',
  authenticateJWT,
  requireBoardPermissions(PERMISSIONS.BOARDS_UPDATE),
  async (req, res) => {
    const serviceResponse = await BoardController.update(req);
    return handleServiceResponse(serviceResponse, res);
  }
);

/**
 * @swagger
 * /boards/{id}:
 *   delete:
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
 */
route.delete('/:id', async (req, res) => {
  const serviceResponse = await BoardController.delete(req);
  return handleServiceResponse(serviceResponse, res);
});

/**
 * @swagger
 * /boards/{id}/restore:
 *   patch:
 *     tags:
 *       - Boards
 *     summary: Restore closed board
 *     description: Set isClosed = false
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
 *         description: Board restored successfully
 *       404:
 *         description: Board not found
 *       403:
 *         description: Forbidden (no permission boards:update on this board)
 */
route.patch(
  '/:id/restore',
  authenticateJWT,
  requireBoardPermissions(PERMISSIONS.BOARDS_UPDATE),
  async (req, res) => {
    const serviceResponse = await BoardController.restore(req);
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
  validateHandle(addMemberToBoardSchema),
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
route.post('/:id/generate-link', async (req, res) => {
  const serviceResponse = await BoardController.createLinkShareBoard(req);
  return handleServiceResponse(serviceResponse, res);
});

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
route.delete('/:id/invite-link', async (req, res) => {
  const serviceResponse = await BoardController.deleteLinkShareBoard(req);
  return handleServiceResponse(serviceResponse, res);
});

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
route.post('/:id/invite/:inviteToken', async (req, res) => {
  const serviceResponse = await BoardController.JoinBoardByLink(req);
  return handleServiceResponse(serviceResponse, res);
});
export default route;

/**
 * @swagger
 * /boards/{id}/transfer-ownership:
 *   patch:
 *     tags:
 *       - Boards
 *     summary: Transfer board ownership
 *     description: Transfer ownership of the board to another user
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Board ID
 *         schema:
 *           type: string
 *       - in: body
 *         name: newOwnerId
 *         required: true
 *         description: New user ID who will become the board owner
 *         schema:
 *           type: object
 *           properties:
 *             newOwnerId:
 *               type: string
 *               example: "507f1f77bcf86cd799439011"
 *     responses:
 *       200:
 *         description: Ownership transferred successfully
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Board or user not found
 */
route.patch('/:id/transfer-ownership', authenticateJWT, async (req, res) => {
  const serviceResponse = await BoardController.transferOwnership(req);
  return handleServiceResponse(serviceResponse, res);
});

/**
 * @swagger
 * /boards/{id}/settings:
 *   patch:
 *     tags:
 *       - Boards
 *     summary: Update board settings
 *     description: Update visibility and permissions of the board
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Board ID
 *         schema:
 *           type: string
 *       - in: body
 *         name: settings
 *         description: Board settings
 *         required: true
 *         schema:
 *           type: object
 *           properties:
 *             visibility:
 *               type: string
 *               enum: [private, workspace, public]
 *               example: private
 *             permissions:
 *               type: array
 *               items:
 *                 type: string
 *               example: ["read", "write", "admin"]
 *     responses:
 *       200:
 *         description: Board settings updated successfully
 *       403:
 *         description: Forbidden (user is not board admin)
 *       400:
 *         description: Invalid visibility or permissions
 *       500:
 *         description: Server Error
 */
route.patch(
  '/:id/settings',
  authenticateJWT,
  requireBoardPermissions(PERMISSIONS.BOARDS_UPDATE), 
  async (req, res) => {
    const serviceResponse = await BoardController.updateSettings(req);
    return handleServiceResponse(serviceResponse, res);
  }
);