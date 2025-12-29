import { Router } from 'express';
import {
  validateRequest,
  handleServiceResponse,
} from '@/common/utils/httpHandlers';
import { ChecklistController } from './checklist.controller';
import {
  CreateChecklistSchema,
  ChecklistIdSchema,
  EditChecklistNameSchema,
} from './checklist.schema';

const route = Router();

route.get('/:id', validateRequest(ChecklistIdSchema), async (req, res) => {
  const response = await ChecklistController.getChecklistById(req.params.id);
  return handleServiceResponse(response, res);
});

route.post('/', validateRequest(CreateChecklistSchema), async (req, res) => {
  const response = await ChecklistController.create(req);
  return handleServiceResponse(response, res);
});

route.patch(
  '/:id',
  validateRequest(EditChecklistNameSchema),
  async (req, res) => {
    const response = await ChecklistController.rename(
      req.params.id,
      req.body.name
    );
    return handleServiceResponse(response, res);
  }
);

route.delete('/:id', validateRequest(ChecklistIdSchema), async (req, res) => {
  const response = await ChecklistController.delete(req.params.id);
  return handleServiceResponse(response, res);
});

export default route;
