import { Router } from 'express';
import { ListController } from './list.controller';
import {
  handleServiceResponse,
  validateRequest,
} from '@/common/utils/httpHandlers';
import {
  ListIdSchema,
  MoveListToBoardSchema,
  MoveAllCardsSchema,
  CopyListSchema,
} from './list.schema';

const route = Router();

/**
 * @swagger
 * /lists/{id}/archive:
 *   patch:
 *     tags:
 *       - Lists
 *     summary: Archive a list
 *     description: Archive a list by setting it as archived
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: List ID
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: List archived successfully
 *       400:
 *         description: Invalid input
 *       404:
 *         description: List not found
 */
route.patch(
  '/lists/:id/archive',
  validateRequest(ListIdSchema),
  async (req, res) => {
    const listId = req.params.id;
    const response = await ListController.archiveList(listId);
    return handleServiceResponse(response, res);
  }
);

/**
 * @swagger
 * /lists/{id}/unarchive:
 *   patch:
 *     tags:
 *       - Lists
 *     summary: Unarchive a list
 *     description: Restore an archived list
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: List ID
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: List unarchived successfully
 *       400:
 *         description: Invalid input
 *       404:
 *         description: List not found
 */
route.patch(
  '/lists/:id/unarchive',
  validateRequest(ListIdSchema),
  async (req, res) => {
    const listId = req.params.id;
    const response = await ListController.unarchiveList(listId);
    return handleServiceResponse(response, res);
  }
);

/**
 * @swagger
 * /lists/{id}/archive-cards:
 *   patch:
 *     tags:
 *       - Lists
 *     summary: Archive all cards in a list
 *     description: Archive all cards belonging to a specific list
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: List ID
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: All cards archived successfully
 *       400:
 *         description: Invalid input
 *       404:
 *         description: List not found
 */
route.patch(
  '/lists/:id/archive-cards',
  validateRequest(ListIdSchema),
  async (req, res) => {
    const listId = req.params.id;
    const response = await ListController.archiveAllCardsInList(listId);
    return handleServiceResponse(response, res);
  }
);

/**
 * @swagger
 * /lists/{id}/move:
 *   put:
 *     tags:
 *       - Lists
 *     summary: Move a list to a different board
 *     description: Transfer a list from one board to another
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: List ID
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - boardId
 *             properties:
 *               boardId:
 *                 type: string
 *                 format: uuid
 *                 example: "a3b9e74d-1234-5678-9abc-def012345678"
 *     responses:
 *       200:
 *         description: List moved successfully
 *       400:
 *         description: Invalid input
 *       404:
 *         description: List or board not found
 */
route.put(
  '/lists/:id/move',
  validateRequest(MoveListToBoardSchema),
  async (req, res) => {
    const listId = req.params.id;
    const { boardId } = req.body;
    const response = await ListController.moveListToBoard(listId, boardId);
    return handleServiceResponse(response, res);
  }
);

/**
 * @swagger
 * /lists/{id}/move-all-cards:
 *   patch:
 *     tags:
 *       - Lists
 *     summary: Move all cards from one list to another
 *     description: Transfer all cards from source list to target list
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Source List ID
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - targetListId
 *             properties:
 *               targetListId:
 *                 type: string
 *                 format: uuid
 *                 example: "b4c8e85d-2345-6789-0bcd-efa123456789"
 *               targetBoardId:
 *                 type: string
 *                 format: uuid
 *                 example: "c5d9f96e-3456-7890-1cde-fab234567890"
 *                 description: Optional - if moving to a different board
 *     responses:
 *       200:
 *         description: Cards moved successfully
 *       400:
 *         description: Invalid input
 *       404:
 *         description: List not found
 */
route.patch(
  '/lists/:id/move-all-cards',
  validateRequest(MoveAllCardsSchema),
  async (req, res) => {
    const listId = req.params.id;
    const { targetListId, targetBoardId } = req.body;
    const response = await ListController.moveAllCardsToAnotherList(
      listId,
      targetListId,
      targetBoardId
    );
    return handleServiceResponse(response, res);
  }
);

/**
 * @swagger
 * /lists/{id}/copy:
 *   post:
 *     tags:
 *       - Lists
 *     summary: Copy a list to another board
 *     description: Create a duplicate of a list with all its cards in a target board
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Source List ID to copy
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - targetBoardId
 *             properties:
 *               targetBoardId:
 *                 type: string
 *                 format: uuid
 *                 example: "a3b9e74d-1234-5678-9abc-def012345678"
 *                 description: Board where the list will be copied to
 *               title:
 *                 type: string
 *                 example: "My New List"
 *                 description: Optional - custom title for copied list (defaults to "Original Title (Copy)")
 *               position:
 *                 type: integer
 *                 minimum: 0
 *                 example: 0
 *                 description: Optional - position in target board (defaults to last position)
 *     responses:
 *       201:
 *         description: List copied successfully
 *       400:
 *         description: Invalid input
 *       404:
 *         description: Source list or target board not found
 */
route.post(
  '/lists/:id/copy',
  validateRequest(CopyListSchema),
  async (req, res) => {
    const listId = req.params.id;
    const { targetBoardId, title, position } = req.body;
    const response = await ListController.copyListToBoard(
      listId,
      targetBoardId,
      title,
      position
    );
    return handleServiceResponse(response, res);
  }
);

export default route;
