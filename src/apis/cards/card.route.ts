import {
  handleServiceResponse,
  validateRequest,
} from '@/common/utils/httpHandlers';
import { Router } from 'express';
import {
  CardIdSchema,
  CreateCardSchema,
  GetCardSchema,
  UpdateCardSchema,
} from './card.schema';
import { CardController } from './card.controller';

const route = Router();

// Get a card
route.get('/:id', validateRequest(GetCardSchema), async (req, res) => {
  const response = await CardController.getCard(req);
  return handleServiceResponse(response, res);
});

// Create a card
route.post('/', validateRequest(CreateCardSchema), async (req, res) => {
  const response = await CardController.createCard(req);
  return handleServiceResponse(response, res);
});

// Update a card
route.put('/:id', validateRequest(UpdateCardSchema), async (req, res) => {
  const response = await CardController.updateCard(req);
  return handleServiceResponse(response, res);
});

// Delete a card
route.delete('/:id', validateRequest(CardIdSchema), async (req, res) => {
  const response = await CardController.deleteCard(req);
  return handleServiceResponse(response, res);
});

export default route;
