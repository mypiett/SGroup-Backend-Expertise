import { Router } from 'express';
import { BoardController } from './board.controller';
import { handleServiceResponse } from '@/common/utils/httpHandlers';
import authenticateJWT from '@/common/middleware/authentication';
import {
  requireWorkspacePermissions,
  requireBoardPermissions,
} from '@/common/middleware/authorization';
import { PERMISSIONS } from '@/common/constants/permissions';
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

  requireWorkspacePermissions(PERMISSIONS.BOARDS_CREATE),
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
  requireWorkspacePermissions(PERMISSIONS.BOARDS_READ),
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
 * /boards/{id}/permanent:
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
route.delete('/:id/permanent', async (req, res) => {
  const serviceResponse = await BoardController.deleteBoardPermanently(req);
  return handleServiceResponse(serviceResponse, res);
});


export default route;
