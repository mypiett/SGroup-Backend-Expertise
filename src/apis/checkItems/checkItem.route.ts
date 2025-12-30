import { Router } from 'express';
import { CheckItemController } from './checkItem.controller';
import {
  validateRequest,
  handleServiceResponse,
} from '@/common/utils/httpHandlers';
import {
  CreateCheckItemSchema,
  UpdateCheckItemSchema,
  CheckItemIdSchema,
} from './checkItem.schema';

const route = Router();

route.get('/', async (req, res) => {
  const response = await CheckItemController.getCheckItems(req);
  return handleServiceResponse(response, res);
});

route.get(
  '/:checkItemId',
  validateRequest(CheckItemIdSchema),
  async (req, res) => {
    const response = await CheckItemController.getCheckItem(req);
    return handleServiceResponse(response, res);
  }
);

route.post('/', validateRequest(CreateCheckItemSchema), async (req, res) => {
  const response = await CheckItemController.createCheckItem(req);
  return handleServiceResponse(response, res);
});

route.patch(
  '/:checkItemId',
  validateRequest(UpdateCheckItemSchema),
  async (req, res) => {
    const response = await CheckItemController.updateCheckItem(req);
    return handleServiceResponse(response, res);
  }
);

route.patch('/:checkItemId/toggle', async (req, res) => {
  const response = await CheckItemController.toggleCheckItem(req);
  return handleServiceResponse(response, res);
});

route.delete(
  '/:checkItemId',
  validateRequest(CheckItemIdSchema),
  async (req, res) => {
    const response = await CheckItemController.deleteCheckItem(req);
    return handleServiceResponse(response, res);
  }
);

export default route;
