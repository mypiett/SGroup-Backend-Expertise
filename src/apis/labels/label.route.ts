import {
  handleServiceResponse,
  validateRequest,
} from '@/common/utils/httpHandlers';
import { Router } from 'express';
import {
  GetLabelSchema,
  UpdateLabelSchema,
  DeleteLabelSchema,
} from './label.schema';
import { LabelController } from './label.controller';

const route = Router();

/**
 * @swagger
 * /labels/{id}:
 *   get:
 *     tags:
 *       - Label
 *     summary: Get label
 *     description: Get label by ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Successfully retrieved label
 *       404:
 *         description: Label not found
 */
route.get('/:id', validateRequest(GetLabelSchema), async (req, res) => {
  const response = await LabelController.getLabelById(req);
  return handleServiceResponse(response, res);
});

/**
 * @swagger
 * /labels/{id}:
 *   put:
 *     tags:
 *       - Label
 *     summary: Update label
 *     description: Update label information
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               color:
 *                 type: string
 *     responses:
 *       200:
 *         description: Label updated successfully
 */
route.put('/:id', validateRequest(UpdateLabelSchema), async (req, res) => {
  const response = await LabelController.updateLabel(req);
  return handleServiceResponse(response, res);
});

/**
 * @swagger
 * /labels/{id}:
 *   delete:
 *     tags:
 *       - Label
 *     summary: Delete label
 *     description: Delete a label
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Label deleted successfully
 */
route.delete('/:id', validateRequest(DeleteLabelSchema), async (req, res) => {
  const response = await LabelController.deleteLabel(req);
  return handleServiceResponse(response, res);
});

export default route;
